import { useAuth } from "./AuthContext";

export const modulesKeys = {
    Dashboard: 'Dashboard',
    Users: 'Users',
    SiteCore: 'SiteCore',
    Activities: 'UserActivities',
    CMS: 'CMS',
    Packages: 'Packages',
}

export const adminModules = ['SiteCore', 'UserActivities', 'CMS']

export const Guard = ({children, module}) => {
    const { user } = useAuth();
    if (user && user.user_role !== 'admin' && adminModules.includes(module)) {
        return null; 
    }

    return <>{children}</>;
};