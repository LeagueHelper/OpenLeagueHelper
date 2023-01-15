import Styles from './AppFooter.module.scss';

const AppFooter = () => {
    return (
        <div className={Styles.AppFooter}>
            <div className={Styles.AppVersion}>
                <p>Version: {window.electron.app.getVersion()}</p>
            </div>
        </div>
    );
};

export default AppFooter;
