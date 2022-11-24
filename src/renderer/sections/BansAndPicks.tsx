import Role from 'api/entities/Role';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Divider } from '@blueprintjs/core';
import Settings from 'renderer/components/Settings/Settings';
import AppFrame from 'renderer/components/AppFrame/AppFrame';
import { useState } from 'react';
import cx from 'classnames';
import SelectChampions from '../components/SelectChampions/SelectChampions';
import Styles from './BansAndPicks.module.scss';
import Button from '../UI/Button/Button';

const BansAndPicks = () => {
    const [role, setRole] = useState<Role>(Role.Mid);

    return (
        <>
            <AppFrame />
            <div className={Styles.AppContainer}>
                <div className={Styles.roleButtonContainer}>
                    <Button
                        className={cx(
                            { [Styles.activeRole]: role === Role.Top },
                            Styles.roleButton
                        )}
                        onClick={() => setRole(Role.Top)}
                    >
                        Top
                    </Button>
                    <Button
                        className={cx(
                            {
                                [Styles.activeRole]: role === Role.Jungle,
                            },
                            Styles.roleButton
                        )}
                        onClick={() => setRole(Role.Jungle)}
                    >
                        Jungle
                    </Button>
                    <Button
                        className={cx(
                            { [Styles.activeRole]: role === Role.Mid },
                            Styles.roleButton
                        )}
                        onClick={() => setRole(Role.Mid)}
                    >
                        Mid
                    </Button>
                    <Button
                        className={cx(
                            { [Styles.activeRole]: role === Role.Bot },
                            Styles.roleButton
                        )}
                        onClick={() => setRole(Role.Bot)}
                    >
                        ADC
                    </Button>
                    <Button
                        className={cx(
                            {
                                [Styles.activeRole]: role === Role.Support,
                            },
                            Styles.roleButton
                        )}
                        onClick={() => setRole(Role.Support)}
                    >
                        Support
                    </Button>
                </div>

                <div className="BansAndPicks">
                    <SelectChampions
                        title="Picks"
                        role={role}
                        useCase="picks"
                    />
                    <Divider />
                    <SelectChampions title="Bans" role={role} useCase="bans" />
                </div>
            </div>
        </>
    );
};

export default BansAndPicks;
