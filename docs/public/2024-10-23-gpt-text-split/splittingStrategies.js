const splittingStrategies = [
    {
        displayName: "Split by N characters",
        input: [
            { parameterName: "limit", parameterType: "number", defaultValue: 160100 }
        ],
        func: function (text, limit) {
            const result = [];
            for (let i = 0; i < text.length; i += limit) {
                result.push(text.substring(i, i + limit));
            }
            return result;
        },
    },
    {
        displayName: "Split by sentences",
        input: [],
        func: function (text) {
            return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
        }
    },
    {
        displayName: "Split by lines",
        input: [],
        func: function (text) {
            return text.split(/\r?\n/);
        }
    }
];

