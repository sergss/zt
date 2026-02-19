function testStep2(T) {
    T.assert(window.Input, 'Input module exists');

    // Test key state
    Input.keys['KeyW'] = true;
    T.assert(Input.isDown('KeyW'), 'isDown returns true for pressed key');
    T.assert(!Input.isDown('KeyS'), 'isDown returns false for unpressed key');

    // Test action mapping
    T.assert(Input.isActionActive('forward'), 'forward action active when KeyW pressed');

    Input.keys['KeyW'] = false;
    Input.keys['ArrowUp'] = true;
    T.assert(Input.isActionActive('forward'), 'forward action active when ArrowUp pressed');

    Input.keys['ArrowUp'] = false;
    T.assert(!Input.isActionActive('forward'), 'forward action inactive when no keys pressed');

    // Clean up
    Input.keys = {};
}
