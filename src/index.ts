/*
 * Copyright (c) Arm Ltd
 */

import { getApiTargets, ApiTarget } from './api-targets';
import { getMbedTargets, TargetsJson, BRANCH } from './mbed-targets';
import { getCmsisPacks, CmsisPacks } from './cmsis-packs';

interface result {
    heading: string;
    data: string[];
}

const stats = (apiTargets: ApiTarget[], mbedTargets: TargetsJson, packs: CmsisPacks): result[] => {

    let apiPacks = 0;
    let deviceNames = 0;

    apiTargets.forEach(apiTarget => {
        if (apiTarget.device_name && packs.devices[apiTarget.device_name]) {
            apiPacks ++;
        }

        const key = apiTarget.board_type.toUpperCase();
        const mbedTarget = mbedTargets[key];

        if (mbedTarget) {
            if (!!mbedTarget.device_name && !!apiTarget.device_name && mbedTarget.device_name === apiTarget.device_name) {
                deviceNames ++;
            }
        }
    });

    const detectKeys = Object.keys(mbedTargets).filter(key => {
        const code = mbedTargets[key].detect_code;
        return (code && code.length);
    });

    return [{
        heading: 'Statistics',
        data: [
            `Devices in the API: ${apiTargets.length}`,
            `Devices in Mbed OS ${BRANCH}: ${Object.keys(mbedTargets).length}`,
            `CMSIS Packs in Mbed Studio: ${Object.keys(packs.packs).length}`,
            `Debug targets in Mbed Studio: ${Object.keys(packs.devices).length}`,
            `API devices with matching debug target in Mbed Studio: ${apiPacks}`,
            `API devices with matching device_name in Mbed OS ${BRANCH}: ${deviceNames}`,
            `Mbed OS ${BRANCH} devices with a detect key: ${detectKeys.length}`
        ]
    }];
};

const deviceNames = (apiTargets: ApiTarget[], mbedTargets: TargetsJson): result[] => {

    let missingApi: string[] = [];
    let missingMbed: string[] = [];
    let misMatch: string[] = [];

    apiTargets.forEach(apiTarget => {
        const key = apiTarget.board_type.toUpperCase();
        const mbedTarget = mbedTargets[key];

        if (mbedTarget) {
            if (mbedTarget.device_name && !apiTarget.device_name) {
                missingApi.push(`${key} - ${mbedTarget.device_name}`);
            }

            if (!mbedTarget.device_name && apiTarget.device_name) {
                missingMbed.push(`${key} - ${apiTarget.device_name}`);
            }

            if (!!mbedTarget.device_name && !!apiTarget.device_name && mbedTarget.device_name !== apiTarget.device_name) {
                misMatch.push(`${key} - API: ${apiTarget.device_name}, Mbed: ${mbedTarget.device_name}`);
            }
        }
    });

    return [
        {
            heading: `API devices missing device name, but found in Mbed OS ${BRANCH}`,
            data: missingApi
        },
        {
            heading: `Mbed OS ${BRANCH} devices missing device name, but found in API`,
            data: missingMbed
        },
        {
            heading: `Device names mis-matching between Mbed OS ${BRANCH} and API`,
            data: misMatch
        }
    ];
};

const detectCodes = (apiTargets: ApiTarget[], mbedTargets: TargetsJson): result[] => {

    const multipleDetect: string[] = [];
    Object.keys(mbedTargets).forEach(key => {
        const code = mbedTargets[key].detect_code;
        if (code && code.length > 1) {
            multipleDetect.push(key);
        }
    });

    const missingDetect: string[] = [];
    apiTargets.forEach(apiTarget => {
        const key = apiTarget.board_type.toUpperCase();
        const mbedTarget = mbedTargets[key];

        if (mbedTarget && (!mbedTarget.detect_code || mbedTarget.detect_code.length === 0)) {
            missingDetect.push(`${key} - ${apiTarget.product_code}`);
        }
    });

    return [
        {
            heading: `Mbed OS ${BRANCH} devices with multiple detect codes`,
            data: multipleDetect
        },
        {
            heading: `Mbed OS ${BRANCH} devices missing detect code, but found in API`,
            data: missingDetect
        }
    ];
};

const packDevices = (apiTargets: ApiTarget[], packs: CmsisPacks): result[] => {
    const missing: string[] = [];
    const disabled: string[] = [];

    apiTargets.forEach(apiTarget => {
        if (apiTarget.device_name) {
            const deviceName = apiTarget.device_name;
            const entry = packs.devices[deviceName];

            if (!entry) {
                missing.push(`${apiTarget.name} - ${deviceName}`);
                return;
            }

            if (!entry.enabled) {
                disabled.push(`${apiTarget.name} - ${deviceName}`);
            }
        }
    });

    return [
        {
            heading: 'API devices with debug target, but not found in Mbed Studio',
            data: missing
        },
        {
            heading: 'API devices with disabled debug target in Mbed Studio',
            data: disabled
        }
    ];
};

export const runReport = async (): Promise<result[]> => {
    const apiTargets = await getApiTargets();
    const mbedTargets = await getMbedTargets();
    const cmsisPacks = await getCmsisPacks();

    const statResults = stats(apiTargets, mbedTargets, cmsisPacks);
    const deviceNameResults = deviceNames(apiTargets, mbedTargets);
    const detectCodeResults = detectCodes(apiTargets, mbedTargets);
    const packDeviceResults = packDevices(apiTargets, cmsisPacks);

    return [
        ...statResults,
        ...deviceNameResults,
        ...detectCodeResults,
        ...packDeviceResults
    ];
};
