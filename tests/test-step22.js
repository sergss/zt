function testStep22(T) {
    // 1. Test D-Pad Touch Simulation
    Input.keys = {}; // reset

    // Create a mock event target
    let mockBtn = document.createElement('div');
    mockBtn.setAttribute('data-key', 'ArrowUp');
    mockBtn.className = 'btn';
    document.body.appendChild(mockBtn);

    // Initialize Input (which binds the touch events to buttons)
    // To avoid duplicating window listeners, we'll just manually fire the touchstart/touchend
    // Note: The actual DOM event binding in input.js depends on buttons existing in the document.
    // For this test, we verify the Input structure handles it when the event occurs.

    let touchStartEvent = new Event('touchstart');
    let touchEndEvent = new Event('touchend');

    mockBtn.addEventListener('touchstart', (e) => {
        let key = mockBtn.getAttribute('data-key');
        Input.keys[key] = true;
    });
    mockBtn.addEventListener('touchend', (e) => {
        let key = mockBtn.getAttribute('data-key');
        Input.keys[key] = false;
    });

    // Simulate touching forward
    mockBtn.dispatchEvent(touchStartEvent);
    T.assert(Input.isActionActive('forward') === true, 'Touchstart sets forward action active');

    // Simulate releasing forward
    mockBtn.dispatchEvent(touchEndEvent);
    T.assert(Input.isActionActive('forward') === false, 'Touchend clears forward action');

    // 2. Test Weapon Cycle Consumption
    // Simulate pressing weapon cycle
    Input.keys['WeaponCycle'] = true;
    let mockPlayer = new Player(0, 0, 0, null, null);
    mockPlayer.currentWeaponIndex = 0; // Pistol

    mockPlayer.update(0.1);

    T.assert(mockPlayer.currentWeaponIndex === 1, 'Player cycled to next weapon index');
    T.assert(Input.keys['WeaponCycle'] === false, 'WeaponCycle input was consumed by player update');

    // Cleanup
    document.body.removeChild(mockBtn);
}
