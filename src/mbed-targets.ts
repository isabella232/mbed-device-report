/*
 * Copyright (c) Arm Ltd
 */

const BRANCH = 'master';
const TARGET_URL = `https://raw.githubusercontent.com/ARMmbed/mbed-os/${BRANCH}/targets/targets.json`;

/**
 * Representation of the JSON in mbed-os/targets/targets.json.
 */
export interface TargetsJson {
    [key: string]: TargetData;
}

export interface TargetData {
    key: string;
    core?: string | null;
    default_toolchain?: string;
    supported_toolchains?: string[] | null;
    extra_labels?: string[];
    is_disk_virtual?: boolean;
    macros?: string[];
    device_has?: string[];
    features?: string[];
    detect_code?: string[];
    public?: boolean;
    default_lib?: string;
    bootloader_supported?: boolean;
    config?: TargetConfig;
    device_name?: string;
    offset?: TargetOffsetObject[];

    [key: string]: string | string[] | number | boolean | TargetConfig | TargetValueObject | TargetOffsetObject[] |
        null | undefined;
}

export interface TargetConfig {
    [key: string]: ConfigPair;
}

export interface TargetValueObject {
    [key: string]: string | string[] | number | null;
}

export interface TargetOffsetObject {
    boot: string;
    name: string;
    offset: number;
}

export interface ConfigPair {
    help?: string;
    macro_name?: string;
    value?: string | number | null;
}

export const getMbedTargets = async (): Promise<TargetsJson> => {
    const response = await fetch(TARGET_URL);
    const json: TargetsJson = await response.json();
    return json;
};
