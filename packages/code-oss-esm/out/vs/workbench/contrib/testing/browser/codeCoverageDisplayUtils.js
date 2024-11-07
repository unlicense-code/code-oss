/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { assertNever } from '../../../../base/common/assert.js';
import { clamp } from '../../../../base/common/numbers.js';
import { localize } from '../../../../nls.js';
import { chartsGreen, chartsRed, chartsYellow } from '../../../../platform/theme/common/colorRegistry.js';
import { asCssVariableName } from '../../../../platform/theme/common/colorUtils.js';
import { getTotalCoveragePercent } from '../common/testCoverage.js';
export const percent = (cc) => clamp(cc.total === 0 ? 1 : cc.covered / cc.total, 0, 1);
const colorThresholds = [
    { color: `var(${asCssVariableName(chartsRed)})`, key: 'red' },
    { color: `var(${asCssVariableName(chartsYellow)})`, key: 'yellow' },
    { color: `var(${asCssVariableName(chartsGreen)})`, key: 'green' },
];
export const getCoverageColor = (pct, thresholds) => {
    let best = colorThresholds[0].color; //  red
    let distance = pct;
    for (const { key, color } of colorThresholds) {
        const t = thresholds[key] / 100;
        if (t && pct >= t && pct - t < distance) {
            best = color;
            distance = pct - t;
        }
    }
    return best;
};
const epsilon = 10e-8;
export const displayPercent = (value, precision = 2) => {
    const display = (value * 100).toFixed(precision);
    // avoid showing 100% coverage if it just rounds up:
    if (value < 1 - epsilon && display === '100') {
        return `${100 - (10 ** -precision)}%`;
    }
    return `${display}%`;
};
export const calculateDisplayedStat = (coverage, method) => {
    switch (method) {
        case "statement" /* TestingDisplayedCoveragePercent.Statement */:
            return percent(coverage.statement);
        case "minimum" /* TestingDisplayedCoveragePercent.Minimum */: {
            let value = percent(coverage.statement);
            if (coverage.branch) {
                value = Math.min(value, percent(coverage.branch));
            }
            if (coverage.declaration) {
                value = Math.min(value, percent(coverage.declaration));
            }
            return value;
        }
        case "totalCoverage" /* TestingDisplayedCoveragePercent.TotalCoverage */:
            return getTotalCoveragePercent(coverage.statement, coverage.branch, coverage.declaration);
        default:
            assertNever(method);
    }
};
export function getLabelForItem(result, testId, commonPrefixLen) {
    const parts = [];
    for (const id of testId.idsFromRoot()) {
        const item = result.getTestById(id.toString());
        if (!item) {
            break;
        }
        parts.push(item.label);
    }
    return parts.slice(commonPrefixLen).join(' \u203a ');
}
export var labels;
(function (labels) {
    labels.showingFilterFor = (label) => localize('testing.coverageForTest', "Showing \"{0}\"", label);
    labels.clickToChangeFiltering = localize('changePerTestFilter', 'Click to view coverage for a single test');
    labels.percentCoverage = (percent, precision) => localize('testing.percentCoverage', '{0} Coverage', displayPercent(percent, precision));
    labels.allTests = localize('testing.allTests', 'All tests');
    labels.pickShowCoverage = localize('testing.pickTest', 'Pick a test to show coverage for');
})(labels || (labels = {}));
