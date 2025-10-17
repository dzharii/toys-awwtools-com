# Typewriter Application - Test Checklist

## Visual Tests

### Background
- [ ] Gradient background displays correctly
- [ ] Low-poly SVG pattern overlay visible
- [ ] Background doesn't interfere with readability

### Controls
- [ ] Dropdown menu appears in top-right corner
- [ ] All 6 sound profiles are listed
- [ ] Dropdown has proper styling and hover effects

### Paper
- [ ] Paper textarea is centered and styled correctly
- [ ] Ruled lines visible in background
- [ ] Paper has realistic shadow and depth
- [ ] Placeholder text "Start typing..." appears
- [ ] Paper is initially ~5 lines tall

### Keyboard
- [ ] SVG keyboard is fixed at bottom of viewport
- [ ] All keys are visible and properly positioned
- [ ] Keys have pseudo-3D appearance (gradients/shadows)
- [ ] Keyboard rows are properly aligned (QWERTY layout)
- [ ] Special keys (Shift, Enter, Space, etc.) have correct sizes

## Interaction Tests

### Hardware Keyboard
- [ ] Typing letters adds them to paper
- [ ] Numbers work correctly
- [ ] Special characters (punctuation) work
- [ ] Backspace deletes characters
- [ ] Enter creates new line
- [ ] Tab inserts 4 spaces
- [ ] Space bar adds spaces

### Visual Feedback
- [ ] Hardware keys highlight on keydown
- [ ] Keys unhighlight on keyup
- [ ] Correct key highlights for each press
- [ ] Shift keys highlight when pressed
- [ ] Enter key highlights

### Virtual Keyboard (Mouse)
- [ ] Clicking keys types characters
- [ ] Clicking Enter creates newline
- [ ] Clicking Backspace deletes
- [ ] Clicking Tab inserts spaces
- [ ] Keys show hover effect
- [ ] Keys show active/pressed state on click

### Paper Growth
- [ ] Paper height increases when Enter is pressed
- [ ] Paper grows smoothly (with transition)
- [ ] Paper scrolls automatically to show cursor
- [ ] Paper maintains minimum height (400px)
- [ ] Scrollbar appears when content overflows

## Audio Tests

### Sound Initialization
- [ ] Audio context initializes on first keypress/click
- [ ] No errors in console related to audio

### Classic Profile
- [ ] Produces mechanical "clack" sound
- [ ] Sound is pleasant and not too loud
- [ ] Frequency around 180Hz

### Soft Profile
- [ ] Produces gentle, quiet sound
- [ ] Lower volume than classic
- [ ] Damped attack

### Clacky Profile
- [ ] High-pitched "click" sound
- [ ] Frequency around 300Hz
- [ ] Sharp and crisp

### Thud Profile
- [ ] Deep, resonant sound
- [ ] Low frequency (90Hz)
- [ ] Strong, impactful

### Beep Profile
- [ ] Digital tone sound
- [ ] High frequency (600Hz)
- [ ] Retro/electronic feel

### Random Profile
- [ ] Each keypress sounds different
- [ ] Variety of frequencies and types
- [ ] Still pleasant to hear

### Enter Key Sound
- [ ] Produces distinct "ding" sound
- [ ] Different from typing sounds
- [ ] High-pitch tone (880Hz)
- [ ] Longer duration (~300ms)

### Profile Switching
- [ ] Dropdown changes profile immediately
- [ ] Sample sound plays when profile selected
- [ ] All subsequent keypresses use new profile
- [ ] No delay or audio artifacts

## Edge Cases

### Content
- [ ] Very long lines don't break layout
- [ ] Many lines (50+) work correctly
- [ ] Empty paper works fine
- [ ] Rapid typing doesn't cause issues

### Audio
- [ ] Rapid keypresses don't distort sound
- [ ] Multiple simultaneous keys handled
- [ ] No audio clipping or artifacts

### UI
- [ ] Resizing window doesn't break layout
- [ ] Keyboard stays at bottom when scrolling
- [ ] Controls stay in top-right

## Browser Compatibility

- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile browsers (if applicable)

## Performance

- [ ] Smooth typing with no lag
- [ ] Key highlighting is instant
- [ ] Audio plays without delay
- [ ] No memory leaks with extended use
- [ ] CPU usage reasonable

## Offline/Local Use

- [ ] Works when opened via file:// protocol
- [ ] No console errors about CORS or network
- [ ] No external dependencies loaded
- [ ] All resources local

## Console

- [ ] No JavaScript errors
- [ ] No CSS errors
- [ ] Welcome messages appear (optional)
- [ ] No warnings

---

## Notes

Record any issues, bugs, or unexpected behavior below:

[Your notes here]
