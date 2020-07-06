/*
 * Copyright (c) Arm Ltd
 */

const PACKS_URL = 'https://s3-us-west-2.amazonaws.com/mbed-studio-private/tools/linux/cmsis-packs/cmsis-packs.json';

export interface CmsisPacks {
    devices: {
        [key: string]: {
            packId: string;
            enabled: boolean;
        }
    };
    boards: {
        [key: string]: {
            deviceNames: string[];
            packId: string;
        }
    },
    packs: {
        [key: string]: {
            version: string;
            family: string;
            vendor: string;
            packName: string;
            bundledPackName: string;
        }
    },
    vendors: {
        [key: string]: string[];
    }
}

export const getCmsisPacks = async (): Promise<CmsisPacks | undefined> => {
    try {
        const response = await fetch(PACKS_URL);
        const json = await response.json();
        return json;
    } catch (e) {
        return undefined
    }
};
