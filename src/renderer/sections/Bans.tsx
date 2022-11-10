import Role from 'api/entities/Role';
import { useSearchParams } from 'react-router-dom';
import SelectChampions from '../components/SelectChampions';

const Bans = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const roleVar = searchParams.get('role') as Role;
    return <SelectChampions title="Bans" role={roleVar} useCase="bans" />;
};

export default Bans;
