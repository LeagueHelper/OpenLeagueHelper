import Phase from './entities/Phase';
import Role from './entities/Role';
import { Cell, Type } from './entities/Cell';
import { TeamElement } from './entities/TeamElement';

export class GameSession {
    private gameId: number;

    private bannedChampions: Set<number> = new Set();

    private pickedChampions: Set<number> = new Set();

    private role: Role = Role.Top;

    private myTeam: TeamElement[];

    private phase: Phase = Phase.Banning;

    constructor(gameId: number, myTeam: TeamElement[], localCellId: number) {
        this.gameId = gameId;
        this.myTeam = myTeam;
        for (let index = 0; index < myTeam.length; index += 1) {
            const element = myTeam[index];
            if (element.cellId === localCellId) {
                this.role = element.assignedPosition as Role;
            }
        }
    }

    /**
     * @description process all data from actions to populate GameSession instance
     * for example banned and picked champions
     */
    public processData(cellList: Array<Cell>[]) {
        cellList.forEach((cellArray) => {
            cellArray.forEach((cell) => {
                // We check if banned and completed and picked and completed
                if (cell.type === Type.ban && cell.completed) {
                    this.bannedChampions.add(cell.championId);
                } else if (cell.type === Type.pick && cell.completed) {
                    this.pickedChampions.add(cell.championId);
                }
                if (cell.isInProgress) {
                    if (cell.type === Type.ban) {
                        this.phase = Phase.Banning;
                    } else if (cell.type === Type.pick) {
                        this.phase = Phase.Picking;
                    } else if (cell.type === Type.ten_bans_reveal) {
                        this.phase = Phase.RevealingBans;
                    }
                }
            });
        });
    }

    public findBan(orderedBans: number[]): number {
        let ban = -1;
        const intents = new Set();
        for (let index = 0; index < this.myTeam.length; index += 1) {
            const player = this.myTeam[index];
            intents.add(player.championPickIntent);
        }

        // This should always find an id to ban because it is supposed that the user
        // had input 5 bans
        for (let index = 0; index < orderedBans.length; index += 1) {
            const element = orderedBans[index];
            if (!intents.has(element)) {
                ban = element;
                break;
            }
        }

        return ban;
    }

    public findPick(orderedPicks: number[]): number {
        let pick = -1;
        // I should take into account the intents, but for now... meh
        for (let index = 0; index < orderedPicks.length; index += 1) {
            const element = orderedPicks[index];
            // we check the intended pick is not banned neither picked
            if (
                !this.bannedChampions.has(element) &&
                !this.pickedChampions.has(element)
            ) {
                pick = element;
                break;
            }
        }
        return pick;
    }

    public getGameId(): number {
        return this.gameId;
    }

    public getRole(): Role {
        return this.role;
    }

    public getBannedChampions(): number[] {
        return Array.from(this.bannedChampions);
    }

    public getPickedChampions(): number[] {
        return Array.from(this.pickedChampions);
    }

    public getPhase(): Phase {
        return this.phase;
    }

    public getMyTeam(): TeamElement[] {
        return this.myTeam;
    }
}

export default GameSession;
