/**
 * ESM Primary Navigation App - Top navigation bar
 */

import {
    Header,
    HeaderName,
    HeaderNavigation,
    HeaderMenuItem,
    HeaderGlobalBar,
    HeaderGlobalAction,
    SideNav,
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
    useNavigate,
    useLocation,
    useUIStore,
    useNotificationStore,
    useAuth,
    useTranslation,
} from '@zs-health/esm-framework';
import {
    Notification as IBMNotification,
    NotificationNew,
    UserAvatar,
    Settings,
    Menu,
    Home,
    Events,
    Activity,
    User as PatientIcon,
    Report,
} from '@zs-health/esm-styleguide';
import './PrimaryNavigation.css';

export function PrimaryNavigation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { notifications } = useNotificationStore();

    const hasUnreadNotifications = notifications.length > 0;

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <>
            {/* Top Header */}
            <Header aria-label="ZS Health" className="zs-header">
                <HeaderGlobalAction
                    aria-label="Menu"
                    onClick={toggleSidebar}
                    className="zs-menu-toggle"
                >
                    <Menu size={20} />
                </HeaderGlobalAction>

                <HeaderName href="/" prefix="">
                    <span className="zs-header-logo">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </span>
                    ZS Health
                </HeaderName>

                <HeaderNavigation aria-label="Main Navigation" className="zs-header-nav">
                    <HeaderMenuItem href="/" isCurrentPage={location.pathname === '/'}>
                        {t('nav.dashboard')}
                    </HeaderMenuItem>
                    <HeaderMenuItem href="/patients" isCurrentPage={isActive('/patients')}>
                        {t('nav.patients')}
                    </HeaderMenuItem>
                    <HeaderMenuItem href="/appointments" isCurrentPage={isActive('/appointments')}>
                        {t('nav.appointments')}
                    </HeaderMenuItem>
                </HeaderNavigation>

                <HeaderGlobalBar>
                    <HeaderGlobalAction
                        aria-label="Notifications"
                        onClick={() => navigate('/notifications')}
                    >
                        {hasUnreadNotifications ? <NotificationNew size={20} /> : <IBMNotification size={20} />}
                    </HeaderGlobalAction>

                    <HeaderGlobalAction aria-label="Settings" onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                    </HeaderGlobalAction>

                    <HeaderGlobalAction
                        aria-label="User"
                        tooltipAlignment="end"
                        onClick={() => navigate('/profile')}
                    >
                        <UserAvatar size={20} />
                    </HeaderGlobalAction>
                </HeaderGlobalBar>
            </Header>

            {/* Side Navigation */}
            <SideNav
                aria-label="Side navigation"
                expanded={sidebarOpen}
                className="zs-sidenav"
                isPersistent
            >
                <SideNavItems>
                    <SideNavLink
                        renderIcon={Home}
                        href="/"
                        isActive={location.pathname === '/'}
                    >
                        {t('nav.home')}
                    </SideNavLink>

                    <SideNavLink
                        renderIcon={Activity}
                        href="/dashboard"
                        isActive={isActive('/dashboard')}
                    >
                        {t('nav.dashboard')}
                    </SideNavLink>

                    <SideNavMenu renderIcon={PatientIcon} title={t('nav.patients')}>
                        <SideNavMenuItem href="/patients" isActive={location.pathname === '/patients'}>
                            All Patients
                        </SideNavMenuItem>
                        <SideNavMenuItem href="/patients/new" isActive={isActive('/patients/new')}>
                            Register Patient
                        </SideNavMenuItem>
                        <SideNavMenuItem href="/patients/search" isActive={isActive('/patients/search')}>
                            Search Patients
                        </SideNavMenuItem>
                    </SideNavMenu>

                    <SideNavLink
                        renderIcon={Events}
                        href="/appointments"
                        isActive={isActive('/appointments')}
                    >
                        {t('nav.appointments')}
                    </SideNavLink>

                    <SideNavLink
                        renderIcon={Report}
                        href="/encounters"
                        isActive={isActive('/encounters')}
                    >
                        {t('nav.encounters')}
                    </SideNavLink>

                    <SideNavMenu renderIcon={Settings} title={t('nav.settings')}>
                        <SideNavMenuItem href="/settings/profile" isActive={isActive('/settings/profile')}>
                            {t('nav.profile')}
                        </SideNavMenuItem>
                        <SideNavMenuItem href="/settings/preferences" isActive={isActive('/settings/preferences')}>
                            Preferences
                        </SideNavMenuItem>
                        <SideNavMenuItem onClick={logout}>
                            Logout
                        </SideNavMenuItem>
                    </SideNavMenu>
                </SideNavItems>
            </SideNav>
        </>
    );
}

export default PrimaryNavigation;
