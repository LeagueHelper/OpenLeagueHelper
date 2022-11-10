import { RawChampion } from 'api/entities/RawChampion';
import { Summoner } from 'api/entities/Summoner';

export type SummonerMessage = {
    success: boolean;
    summoner: Summoner;
};

export type ChampionsMessage = {
    success: boolean;
    champions: RawChampion[];
};
