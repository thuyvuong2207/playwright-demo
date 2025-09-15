export interface IRoleProfile {
    role?: Role;
    profile?: Profile;
    hasCanfleet?: boolean;
    response?: any;
}
export enum Role {
    NOROLE = 0, //for any user role
    ADMIN = 1,
    GENERAL_MANAGER = 2,
    COMMERCE_MANAGER = 3,
    SERVICE_MANAGER = 4,
    SERVICE_AGENT = 5,
    FRESHER = 6, //new assign account,
}
export enum Profile {
    NOPROFILE = 0, //for any user profile
    PROFILE1 = 1,
    PROFILE2 = 2,
    PROFILE3 = 3,
}
