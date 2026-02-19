// tests/test-framework.js — минимальный тест-раннер
const TestRunner = {
    results: [],

    assert(condition, testName) {
        this.results.push({
            name: testName,
            passed: !!condition,
            error: condition ? null : 'Assertion failed'
        });
    },

    assertEqual(actual, expected, testName) {
        const passed = actual === expected;
        this.results.push({
            name: testName,
            passed,
            error: passed ? null : `Expected ${expected}, got ${actual}`
        });
    },

    assertInRange(value, min, max, testName) {
        const passed = value >= min && value <= max;
        this.results.push({
            name: testName,
            passed,
            error: passed ? null : `${value} not in range [${min}, ${max}]`
        });
    },

    run() {
        const total = this.results.length;
        const passed = this.results.filter(r => r.passed).length;
        console.log(`\n=== TESTS: ${passed}/${total} passed ===\n`);
        this.results.forEach(r => {
            const icon = r.passed ? '✅' : '❌';
            console.log(`${icon} ${r.name}`);
            if (r.error) console.log(`   → ${r.error}`);
        });
        // Визуализация в DOM
        const output = document.getElementById('test-output');
        if (output) {
            output.innerHTML =
                `<h2>${passed}/${total} passed</h2>` +
                this.results.map(r =>
                    `<div style="color:${r.passed ? 'lime' : 'red'}">
            ${r.passed ? '✅' : '❌'} ${r.name}
            ${r.error ? `<br><small>${r.error}</small>` : ''}
          </div>`
                ).join('');
        }
    }
};
