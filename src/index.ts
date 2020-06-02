/*
 * Copyright (c) Arm Ltd
 */

import { getApiTargets, ApiTarget } from './api-targets';
import { getMbedTargets, TargetsJson } from './mbed-targets';
import { getCmsisPacks, CmsisPacks } from './cmsis-packs';

interface result {
    heading: string;
    data: string[];
}

const deviceNames = (apiTargets: ApiTarget[], mbedTargets: TargetsJson): result[] => {
    console.log(`api entries: ${apiTargets.length}`);
    console.log(`targets.json entries: ${Object.keys(mbedTargets).length}`);
    const keys: string[] = [];

    apiTargets.forEach(apiTarget => {
        const key = apiTarget.board_type.toUpperCase();
        const mbedTarget = mbedTargets[key];

        if (mbedTarget) {
            if (mbedTarget.device_name && !apiTarget.device_name) {
                console.log(`API target with code ${apiTarget.product_code}: missing Mbed device_name: ${mbedTarget.device_name}`);
            }

            if (!mbedTarget.device_name && apiTarget.device_name) {
                console.log(`Mbed target with key ${key}: missing API device_name: ${apiTarget.device_name}`);
            }

            if (!!mbedTarget.device_name && !!apiTarget.device_name) {

                if (mbedTarget.device_name === apiTarget.device_name) {
                    keys.push(key);
                } else {
                    console.log(`code ${apiTarget.product_code} mismatch: API ${apiTarget.device_name}, Mbed: ${mbedTarget.device_name}`);
                }
            }
        }
    });

    console.log(`${keys.length} matching device names!`);
    return [];
};

const detectCodes = (apiTargets: ApiTarget[], mbedTargets: TargetsJson): result[] => {

    console.log(`targets.json entries: ${Object.keys(mbedTargets).length}`);

    let keys = Object.keys(mbedTargets).filter(key => {
        const code = mbedTargets[key].detect_code;
        return (code && code.length === 1);
    });

    console.log(`targets.json entries with a single detect code: ${keys.length}`);

    keys = Object.keys(mbedTargets).filter(key => {
        const code = mbedTargets[key].detect_code;
        return (code && code.length > 1);
    });

    console.log(`targets.json entries with multiple detect codes: ${keys.length}`);

    keys = [];

    apiTargets.forEach(apiTarget => {
        const key = apiTarget.board_type.toUpperCase();
        const mbedTarget = mbedTargets[key];

        if (mbedTarget) {
            if (mbedTarget.device_name && !apiTarget.device_name) {
                keys.push(key);
            }

            if (!mbedTarget.detect_code || mbedTarget.detect_code.length === 0) {
                mbedTarget.detect_code = [apiTarget.product_code];
            }
        }
    });

    console.log(`targets.json entries with device_name not in API: ${keys}`);

    keys = Object.keys(mbedTargets).filter(key => {
        const code = mbedTargets[key].detect_code;
        return (code && code.length === 1);
    });

    console.log(`targets.json entries with a single detect code: ${keys.length}`);

    return [];
};

const packDevices = (apiTargets: ApiTarget[], packs: CmsisPacks): result[] => {
    console.log(`api entries: ${apiTargets.length}`);
    let found = 0;
    const missing: string[] = [];

    apiTargets.forEach(apiTarget => {
        if (apiTarget.device_name) {
            const deviceName = apiTarget.device_name;
            const entry = packs.devices[deviceName];

            if (!entry) {
                missing.push(deviceName);
                return;
            }

            found ++;
            if (!entry.enabled) {
                console.log(`${deviceName} is disabled!`);
            }
        }
    });

    missing.forEach(miss => console.log(`missing device_name: ${miss}`));
    console.log(`${found} api entries with packs!`);
    return [];
};

export const runReport = async (): Promise<result[]> => {
    const apiTargets = await getApiTargets();
    const mbedTargets = await getMbedTargets();
    const cmsisPacks = await getCmsisPacks();

    const deviceNameResults = deviceNames(apiTargets, mbedTargets);
    const detectCodeResults = detectCodes(apiTargets, mbedTargets);
    const packDeviceResults = packDevices(apiTargets, cmsisPacks);

    return {
        ...deviceNameResults,
        ...detectCodeResults,
        ...packDeviceResults
    };
};
