using System;
using System.Globalization;
using System.Threading;

using Builder = SuperIntelligenceBuilder;

internal static class Program
{
    private static int Main(string[] args)
    {
        using var cancellation = new CancellationTokenSource();
        ConsoleCancelEventHandler cancelHandler = (_, e) =>
        {
            e.Cancel = true;
            cancellation.Cancel();
        };
        Console.CancelKeyPress += cancelHandler;
        try
        {
            var options = new Builder.Options();
            for (var i = 0; i < args.Length; i++)
            {
                string Value()
                {
                    if (++i >= args.Length) throw new ArgumentException($"{args[i - 1]} needs a value.");
                    return args[i];
                }
                switch (args[i])
                {
                    case "--help" or "-h":
                        Console.WriteLine("""
                            SuperIntelligenceBuilder - a real runner for an imaginary API

                            dotnet run -- [options]
                              --preview             Print the prompt; create nothing, run nothing.
                              --agent NAME          codex, claude, or copilot (default: discover).
                              --executable PATH     Absolute native executable or JS entry point.
                              --model ID            Model identifier supported by that agent.
                              --timeout SECONDS     Task deadline, from 1 to 86400 (default: 600).
                              --help                Show this help.

                            The sample asks the agent to create generated/hello.txt.
                            Existing AGENTS.md is preserved. See index.html or the header in
                            SuperIntelligenceBuilder.cs for setup, policies and integration.
                            """);
                        return 0;
                    case "--preview": options = options with { Preview = true }; break;
                    case "--agent":
                        options = options with { Agent = Value().ToLowerInvariant() switch
                        {
                            "codex" => Builder.AgentKind.Codex,
                            "claude" => Builder.AgentKind.Claude,
                            "copilot" => Builder.AgentKind.Copilot,
                            _ => throw new ArgumentException("--agent must be codex, claude, or copilot.")
                        } };
                        break;
                    case "--executable": options = options with { ExecutablePath = Value() }; break;
                    case "--model": options = options with { Model = Value() }; break;
                    case "--timeout":
                        if (!int.TryParse(Value(), NumberStyles.None, CultureInfo.InvariantCulture, out var seconds) || seconds is < 1 or > 86400)
                            throw new ArgumentException("--timeout must be an integer between 1 and 86400.");
                        options = options with { Timeout = TimeSpan.FromSeconds(seconds) };
                        break;
                    default: throw new ArgumentException($"Unknown option: {args[i]}. Use --help.");
                }
            }

            // This chain is the task. Literal arguments keep the source self-explanatory.
            // The called methods below are intentionally NOT implemented anywhere.
            dynamic task = Builder.WithFile("AGENTS.md", options, cancellation.Token)
                .CreateDirectory("generated")
                .CreateOrReplaceUtf8File("generated/hello.txt", "Hello, super intelligence!\n")
                .ChangeOnlyTheRequestedFile()
                .DoNotModifyTheSampleOrBuilder()
                .WithConciseOutput();

            Builder.RunResult result = task.Execution;
            Console.WriteLine(result.PreviewPrompt ?? result.Summary);
            if (result.State == Builder.ResultState.Completed)
                Console.WriteLine($"Agent: {result.Agent}\nReport: {result.ReportFile}");
            return 0;
        }
        catch (Builder.BuilderException ex)
        {
            Console.Error.WriteLine($"{ex.Error}: {ex.Message}");
            return ex.Error switch
            {
                Builder.ErrorCode.AgentNotFound => 3,
                Builder.ErrorCode.TimedOut => 124,
                Builder.ErrorCode.TaskBlocked => 4,
                _ => 1
            };
        }
        catch (OperationCanceledException)
        {
            Console.Error.WriteLine("Cancelled. Process termination was attempted; partial edits may remain.");
            return 130;
        }
        catch (ArgumentException ex)
        {
            Console.Error.WriteLine($"Invalid arguments: {ex.Message}");
            return 2;
        }
        finally { Console.CancelKeyPress -= cancelHandler; }
    }
}
