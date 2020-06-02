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
}

export const getCmsisPacks = async (): Promise<CmsisPacks> => {
    const response = await fetch(PACKS_URL, { mode: 'no-cors' });
    const json: CmsisPacks = await response.json();
    return json;
};
