import Role from 'api/entities/Role';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Divider, Button } from '@blueprintjs/core';
import SelectChampions from '../components/SelectChampions';

const Picks = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const roleVar = searchParams.get('role') as Role;
    const navigate = useNavigate();

    return (
        <>
            <Button
                className="backButton"
                onClick={() => {
                    navigate('/', { replace: true });
                }}
            >
                Back
            </Button>
            <div className="roleSetter">
                <SelectChampions title="Picks" role={roleVar} useCase="picks" />
                <Divider />
                <SelectChampions title="Bans" role={roleVar} useCase="bans" />
            </div>
        </>
    );
};

export default Picks;
