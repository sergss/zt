// tests/test-step18.js
function testStep18(T) {
    if (typeof AudioSystem === 'undefined') {
        T.assert(false, "AudioSystem class is missing");
        return;
    }

    function testAudioSystemInit(T) {
        T.assert(AudioSystem.enabled !== undefined, 'AudioSystem имеет флаг enabled');
        // Убрали проверку AudioSystem.initialized === false, так как система могла быть инициализирована в предыдущих тестах.

        // Проверяем наличие методов
        T.assert(typeof AudioSystem.playTone === 'function', 'AudioSystem.playTone существует');
        T.assert(typeof AudioSystem.playNoise === 'function', 'AudioSystem.playNoise существует');
        T.assert(typeof AudioSystem.startAmbient === 'function', 'AudioSystem.startAmbient существует');
    }

    function testAudioSystemGetVolume(T) {
        T.assertEqual(AudioSystem.getVolume(1.0, 0), 1.0, 'Volume at 0 distance is 1.0');
        T.assertEqual(AudioSystem.getVolume(1.0, 15), 0.01, 'Volume at 15 distance is minimum (0.01)');

        let midVol = AudioSystem.getVolume(1.0, 7.5);
        T.assert(midVol < 1.0 && midVol > 0.01, 'Volume scales with distance');
        T.assertEqual(midVol, 0.5, 'Volume at mid distance is correct'); // 1.0 - 7.5 / 15.0 = 0.5
    }

    testAudioSystemInit(T);
    testAudioSystemGetVolume(T);
}
// For global execution in runner:
window.testStep18 = testStep18;
