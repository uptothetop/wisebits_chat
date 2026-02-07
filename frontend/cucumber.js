export default {
    default: {
        require: ['e2e/step-definitions/**/*.ts'],
        requireModule: ['ts-node/register'],
        format: ['progress', 'html:cucumber-report.html', 'json:cucumber-report.json'],
        formatOptions: { snippetInterface: 'async-await' },
        publishQuiet: true,
    },
};
