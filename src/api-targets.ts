/*
 * Copyright (c) Arm Ltd
 */

const TARGET_URL = 'https:///os.mbed.com/api/v4/targets';

interface ApiTargetRaw {
    data: [{
        id: string;
        type: 'target';
        attributes: ApiTarget;
    }];
}

export interface ApiTarget {
    product_code: string;
    target_type: 'platform' | 'module';
    board_type: string;
    name: string;
    device_name?: string;
    flash_size?: number;
    ram_size?: number;
    private?: boolean;
    hidden?: boolean;
    features: { [key: string]: string[] }
}

export const getApiTargets = async (): Promise<ApiTarget[]> => {
    const response = await fetch(TARGET_URL);
    const json: ApiTargetRaw = await response.json();
    return json.data.map(tareget => tareget.attributes);
};
