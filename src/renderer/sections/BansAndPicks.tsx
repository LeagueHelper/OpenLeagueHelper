import Role from 'api/entities/Role';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Divider, Button } from '@blueprintjs/core';
import SelectChampions from '../components/SelectChampions/SelectChampions';

const BansAndPicks = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const roleVar = Role.Bot;
    const navigate = useNavigate();

    return (
        <>
            <div className="roleSetter">
                <SelectChampions title="Picks" role={roleVar} useCase="picks" />
                <Divider />
                <SelectChampions title="Bans" role={roleVar} useCase="bans" />
            </div>
        </>
    );
};

export default BansAndPicks;
