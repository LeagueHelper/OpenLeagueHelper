import Role from './Role';

export type AutopickPreferences = {
    [Role.Top]: {
        picks: Array<number>;
        bans: Array<number>;
    };
    [Role.Jungle]: {
        picks: Array<number>;
        bans: Array<number>;
    };
    [Role.Mid]: {
        picks: Array<number>;
        bans: Array<number>;
    };
    [Role.Bot]: {
        picks: Array<number>;
        bans: Array<number>;
    };
    [Role.Support]: {
        picks: Array<number>;
        bans: Array<number>;
    };
};
