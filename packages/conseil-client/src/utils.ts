import { JSONPath } from 'jsonpath-plus';

export function dataToObj(michelsonData: any[]): Record<string, string> {
    return michelsonData.reduce((result, item) => {
        const key = JSONPath({ path: '$.args[0].string', json: item })[0];
        const value = JSONPath({ path: '$.args[1].bytes', json: item })[0];

        if (value) {
            result[key] = value;
        }

        return result;
    }, {});
}