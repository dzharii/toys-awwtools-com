// File: todo.cs
// Single-file TODO utility for modern .NET and C#
// Public API: Todo.TODO("message")
// Debug-only behavior; fails closed; never throws to caller.

#nullable enable
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public static class Todo
{
    [Conditional("DEBUG")]
    public static void TODO(
        string message,
        [CallerFilePath] string? file = null,
        [CallerLineNumber] int line = 0,
        [CallerMemberName] string? member = null)
    {
        TodoImpl.Log(message, file, line, member);
    }
}

internal static class TodoImpl
{
    private static readonly ConcurrentDictionary<string, bool> _seen = new();
    private static readonly ConcurrentQueue<TodoEntry> _pending = new();

    private static volatile IntPtr _hwnd = IntPtr.Zero;
    private static Thread? _uiThread;
    private static readonly object _uiLock = new();

    internal static void Log(string message, string? file, int line, string? member)
    {
#if !DEBUG
        return;
#else
        try
        {
            message = message ?? string.Empty;
            if (message.Length > 4096) message = message.Substring(0, 4096) + " …";
            file ??= "unknown";
            member ??= "unknown";
            if (line < 0) line = 0;

            if (!TryMarkSeen(message, file, line, member))
                return;

            var entry = TodoEntry.Create(message, file, line, member);

            if (IsWindowsDesktop())
            {
                EnsureWindowSafe();
                if (_hwnd != IntPtr.Zero)
                {
                    _pending.Enqueue(entry);
                    PostMessage(_hwnd, WM_TODO_APPEND, IntPtr.Zero, IntPtr.Zero);
                    return;
                }
            }

            Console.WriteLine(entry.ToConsoleLine());
        }
        catch (Exception ex)
        {
            SafeReportInternalError("Log", ex);
        }
#endif
    }

    private static bool TryMarkSeen(string message, string file, int line, string member)
    {
        try
        {
            string key = $"{file}|{line}|{member}|{message}";
            return _seen.TryAdd(key, true);
        }
        catch (Exception ex)
        {
            SafeReportInternalError("TryMarkSeen", ex);
            return true;
        }
    }

    private static bool IsWindowsDesktop()
    {
        try { return OperatingSystem.IsWindows() && Environment.UserInteractive; }
        catch { return false; }
    }

    private static void EnsureWindowSafe()
    {
        try
        {
            if (_hwnd != IntPtr.Zero) return;
            lock (_uiLock)
            {
                if (_hwnd != IntPtr.Zero) return;
                if (_uiThread != null) return;

                _uiThread = new Thread(TodoWindowThread)
                {
                    IsBackground = true,
                    Name = "TodoStickyNoteUI"
                };
                _uiThread.SetApartmentState(ApartmentState.STA);
                _uiThread.Start();

                var sw = Stopwatch.StartNew();
                while (_hwnd == IntPtr.Zero && sw.ElapsedMilliseconds < 750) Thread.Sleep(10);
            }
        }
        catch (Exception ex)
        {
            SafeReportInternalError("EnsureWindowSafe", ex);
        }
    }

    // -------- Windows UI thread and PInvoke --------

    private static IntPtr _yellowBrush = IntPtr.Zero;
    private static IntPtr _hwndEdit = IntPtr.Zero;
    private static IntPtr _hwndCloseBtn = IntPtr.Zero;
    private static WndProc? _wndProcKeepAlive;

    private static void TodoWindowThread()
    {
        try
        {
            _yellowBrush = CreateSolidBrush(RGB(255, 255, 153));

            _wndProcKeepAlive = WndProcImpl;
            var cls = new WNDCLASSEX
            {
                cbSize = (uint)Marshal.SizeOf<WNDCLASSEX>(),
                lpfnWndProc = Marshal.GetFunctionPointerForDelegate(_wndProcKeepAlive),
                hbrBackground = _yellowBrush,
                hCursor = LoadCursor(IntPtr.Zero, (IntPtr)IDC_ARROW),
                lpszClassName = "TodoStickyNoteClass",
                lpszMenuName = null,
                hInstance = GetModuleHandle(null)
            };
            if (RegisterClassEx(ref cls) == 0)
            {
                SafeWriteLine("[TODO] Failed to register window class.");
                return;
            }

            int width = 380, height = 260, margin = 24;
            int screenW = GetSystemMetrics(SM_CXSCREEN);
            int x = Math.Max(0, screenW - width - margin);
            int y = Math.Max(0, margin);

            IntPtr hwnd = CreateWindowEx(
                WS_EX_TOOLWINDOW,
                "TodoStickyNoteClass",
                "TODO",
                WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX | WS_VISIBLE,
                x, y, width, height,
                IntPtr.Zero, IntPtr.Zero, cls.hInstance, IntPtr.Zero);

            if (hwnd == IntPtr.Zero)
            {
                SafeWriteLine("[TODO] Failed to create TODO window.");
                return;
            }

            _hwnd = hwnd;

            int buttonId = 1;
            _hwndCloseBtn = CreateWindowEx(
                0, "BUTTON", "X", WS_CHILD | WS_VISIBLE,
                width - 36, 8, 24, 24, hwnd, (IntPtr)buttonId, cls.hInstance, IntPtr.Zero);

            _hwndEdit = CreateWindowEx(
                0, "EDIT", "",
                WS_CHILD | WS_VISIBLE | ES_MULTILINE | ES_READONLY | ES_AUTOVSCROLL | WS_VSCROLL,
                12, 44, width - 24, height - 56,
                hwnd, IntPtr.Zero, cls.hInstance, IntPtr.Zero);

            MSG msg;
            while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0)
            {
                TranslateMessage(ref msg);
                DispatchMessage(ref msg);
            }
        }
        catch (Exception ex)
        {
            SafeReportInternalError("TodoWindowThread", ex);
        }
        finally
        {
            try { if (_yellowBrush != IntPtr.Zero) { DeleteObject(_yellowBrush); _yellowBrush = IntPtr.Zero; } } catch { }
            _hwnd = IntPtr.Zero;
            _hwndEdit = IntPtr.Zero;
            _hwndCloseBtn = IntPtr.Zero;
            _uiThread = null;
        }
    }

    private static IntPtr WndProcImpl(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam)
    {
        try
        {
            switch (msg)
            {
                case WM_CREATE:
                    return IntPtr.Zero;

                case WM_CTLCOLORSTATIC:
                case WM_CTLCOLOREDIT:
                    return _yellowBrush;

                case WM_SIZE:
                {
                    int width = LOWORD((uint)lParam);
                    int height = HIWORD((uint)lParam);
                    if (_hwndEdit != IntPtr.Zero) MoveWindow(_hwndEdit, 12, 44, Math.Max(50, width - 24), Math.Max(32, height - 56), true);
                    if (_hwndCloseBtn != IntPtr.Zero) MoveWindow(_hwndCloseBtn, Math.Max(8, width - 36), 8, 24, 24, true);
                    return IntPtr.Zero;
                }

                case WM_COMMAND:
                {
                    int code = HIWORD((uint)wParam);
                    int id = LOWORD((uint)wParam);
                    if (id == 1 && code == BN_CLICKED)
                    {
                        PostMessage(hWnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
                        return IntPtr.Zero;
                    }
                    break;
                }

                case WM_NCHITTEST:
                {
                    var hit = DefWindowProc(hWnd, msg, wParam, lParam);
                    if (hit == (IntPtr)HTCLIENT)
                    {
                        if (_hwndEdit == IntPtr.Zero || _hwndCloseBtn == IntPtr.Zero) return (IntPtr)HTCAPTION;

                        POINT pt = new POINT { X = GET_X_LPARAM(lParam), Y = GET_Y_LPARAM(lParam) };
                        ScreenToClient(hWnd, ref pt);

                        if (!TryGetClientRect(hWnd, _hwndCloseBtn, out var rBtn) ||
                            !TryGetClientRect(hWnd, _hwndEdit, out var rEdit))
                            return (IntPtr)HTCAPTION;

                        if (!PtInRect(ref rBtn, pt) && !PtInRect(ref rEdit, pt))
                            return (IntPtr)HTCAPTION;
                    }
                    return hit;
                }

                case WM_TODO_APPEND:
                {
                    DrainPendingToEdit();
                    return IntPtr.Zero;
                }

                case WM_CLOSE:
                    DestroyWindow(hWnd);
                    return IntPtr.Zero;

                case WM_DESTROY:
                    PostQuitMessage(0);
                    return IntPtr.Zero;
            }
        }
        catch (Exception ex)
        {
            SafeReportInternalError("WndProcImpl", ex);
        }
        return DefWindowProc(hWnd, msg, wParam, lParam);
    }

    private static void DrainPendingToEdit()
    {
        try
        {
            if (_hwndEdit == IntPtr.Zero) return;

            var sb = new StringBuilder();
            while (_pending.TryDequeue(out var entry))
                sb.Append(entry.ToDisplayBlock());

            if (sb.Length == 0) return;

            int len = (int)SendMessage(_hwndEdit, WM_GETTEXTLENGTH, IntPtr.Zero, IntPtr.Zero);
            SendMessage(_hwndEdit, EM_SETSEL, (IntPtr)len, (IntPtr)len);
            SendMessageString(_hwndEdit, EM_REPLACESEL, IntPtr.Zero, sb.ToString());

            const int MaxChars = 256 * 1024;
            len = (int)SendMessage(_hwndEdit, WM_GETTEXTLENGTH, IntPtr.Zero, IntPtr.Zero);
            if (len > MaxChars)
            {
                int target = (int)(MaxChars * 0.75);
                SendMessage(_hwndEdit, EM_SETSEL, IntPtr.Zero, (IntPtr)(len - target));
                SendMessageString(_hwndEdit, EM_REPLACESEL, (IntPtr)1, "");
            }
        }
        catch (Exception ex)
        {
            SafeReportInternalError("DrainPendingToEdit", ex);
        }
    }

    // -------- Data model --------

    private readonly struct TodoEntry
    {
        public readonly string TimeIso;
        public readonly int Pid;
        public readonly int Tid;
        public readonly string ProcessName;
        public readonly string FileName;
        public readonly int Line;
        public readonly string Member;
        public readonly string Message;

        private TodoEntry(string timeIso, int pid, int tid, string proc, string fileName, int line, string member, string message)
        {
            TimeIso = timeIso;
            Pid = pid;
            Tid = tid;
            ProcessName = proc;
            FileName = fileName;
            Line = line;
            Member = member;
            Message = message;
        }

        public static TodoEntry Create(string message, string file, int line, string member)
        {
            string timeIso = DateTimeOffset.Now.ToString("O");
            int pid = GetSafe(() => Environment.ProcessId, 0);
            int tid = GetSafe(() => Environment.CurrentManagedThreadId, 0);
            string proc = GetSafe(() => AppDomain.CurrentDomain.FriendlyName, "process");
            string fileName = GetSafe(() => Path.GetFileName(file), "unknown");

            return new TodoEntry(timeIso, pid, tid, proc, fileName, line, member, message);
        }

        public string ToConsoleLine()
            => $"[TODO] {TimeIso} pid={Pid} tid={Tid} {ProcessName} at {FileName}:{Line} in {Member} - {Message}";

        public string ToDisplayBlock()
            => $"{TimeIso}  pid={Pid} tid={Tid}\r\n{ProcessName} at {FileName}:{Line} in {Member}\r\n- {Message}\r\n\r\n";

        private static T GetSafe<T>(Func<T> f, T fallback)
        {
            try { return f(); } catch { return fallback; }
        }
    }

    // -------- Helpers and diagnostics --------

    private static void SafeReportInternalError(string where, Exception ex)
    {
        try { SafeWriteLine($"[TODO internal error] {where}: {ex.GetType().Name}: {ex.Message}"); } catch { }
    }

    private static void SafeWriteLine(string text)
    {
        try { Console.WriteLine(text); } catch { }
    }

    private static bool TryGetClientRect(IntPtr hwndParent, IntPtr hwndChild, out RECT clientRect)
    {
        clientRect = default;
        if (hwndChild == IntPtr.Zero) return false;
        if (!GetWindowRect(hwndChild, out var rScreen)) return false;
        clientRect = ScreenRectToClient(hwndParent, rScreen);
        return true;
    }

    // -------- PInvoke and Win32 helpers --------

    private const int SM_CXSCREEN = 0;

    private const int WS_OVERLAPPED = 0x00000000;
    private const int WS_CAPTION = 0x00C00000;
    private const int WS_SYSMENU = 0x00080000;
    private const int WS_MINIMIZEBOX = 0x00020000;
    private const int WS_VISIBLE = 0x10000000;
    private const int WS_CHILD = 0x40000000;
    private const int WS_VSCROLL = 0x00200000;
    private const int ES_MULTILINE = 0x0004;
    private const int ES_READONLY = 0x0800;
    private const int ES_AUTOVSCROLL = 0x0040;
    private const int WS_EX_TOOLWINDOW = 0x00000080;

    private const int WM_CREATE = 0x0001;
    private const int WM_SIZE = 0x0005;
    private const int WM_COMMAND = 0x0111;
    private const int WM_CLOSE = 0x0010;
    private const int WM_DESTROY = 0x0002;
    private const int WM_CTLCOLORSTATIC = 0x0138;
    private const int WM_CTLCOLOREDIT = 0x0133;
    private const int WM_NCHITTEST = 0x0084;
    private const int WM_GETTEXTLENGTH = 0x000E;
    private const int WM_APP = 0x8000;
    private const int WM_TODO_APPEND = WM_APP + 1;

    private const int EM_SETSEL = 0x00B1;
    private const int EM_REPLACESEL = 0x00C2;

    private const int BN_CLICKED = 0;

    private const int HTCLIENT = 1;
    private const int HTCAPTION = 2;

    private const int IDC_ARROW = 32512;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct WNDCLASSEX
    {
        public uint cbSize;
        public uint style;
        public IntPtr lpfnWndProc;
        public int cbClsExtra;
        public int cbWndExtra;
        public IntPtr hInstance;
        public IntPtr hIcon;
        public IntPtr hCursor;
        public IntPtr hbrBackground;
        public string? lpszMenuName;
        public string? lpszClassName;
        public IntPtr hIconSm;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG
    {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int pt_x;
        public int pt_y;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT { public int X, Y; }

    [UnmanagedFunctionPointer(CallingConvention.Winapi)]
    private delegate IntPtr WndProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern ushort RegisterClassEx(ref WNDCLASSEX lpwcx);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateWindowEx(
        int dwExStyle, string lpClassName, string? lpWindowName, int dwStyle,
        int x, int y, int nWidth, int nHeight,
        IntPtr hWndParent, IntPtr hMenu, IntPtr hInstance, IntPtr lpParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool DestroyWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern IntPtr DefWindowProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, string lParam);

    private static IntPtr SendMessageString(IntPtr hWnd, int Msg, IntPtr wParam, string text)
        => SendMessage(hWnd, Msg, wParam, text);

    [DllImport("gdi32.dll")]
    private static extern IntPtr CreateSolidBrush(int colorRef);

    [DllImport("gdi32.dll")]
    private static extern bool DeleteObject(IntPtr hObject);

    [DllImport("user32.dll")]
    private static extern int GetSystemMetrics(int nIndex);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    private static extern IntPtr GetModuleHandle(string? lpModuleName);

    [DllImport("user32.dll")]
    private static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

    [DllImport("user32.dll")]
    private static extern bool ScreenToClient(IntPtr hWnd, ref POINT lpPoint);

    [DllImport("user32.dll")]
    private static extern bool PtInRect(ref RECT lprc, POINT pt);

    [DllImport("user32.dll")]
    private static extern void PostQuitMessage(int nExitCode);

    [DllImport("user32.dll")]
    private static extern IntPtr LoadCursor(IntPtr hInstance, IntPtr lpCursorName);

    private static int LOWORD(uint v) => unchecked((short)(v & 0xFFFF));
    private static int HIWORD(uint v) => unchecked((short)((v >> 16) & 0xFFFF));
    private static int GET_X_LPARAM(IntPtr lp) => unchecked((short)((long)lp & 0xFFFF));
    private static int GET_Y_LPARAM(IntPtr lp) => unchecked((short)(((long)lp >> 16) & 0xFFFF));
    private static RECT ScreenRectToClient(IntPtr hwndParent, RECT rScreen)
    {
        var tl = new POINT { X = rScreen.Left, Y = rScreen.Top };
        var br = new POINT { X = rScreen.Right, Y = rScreen.Bottom };
        ScreenToClient(hwndParent, ref tl);
        ScreenToClient(hwndParent, ref br);
        return new RECT { Left = tl.X, Top = tl.Y, Right = br.X, Bottom = br.Y };
    }
    private static int RGB(int r, int g, int b) => (r & 0xFF) | ((g & 0xFF) << 8) | ((b & 0xFF) << 16);
}

