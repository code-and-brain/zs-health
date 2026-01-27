/**
 * ESM Home App - Home dashboard for ZS Health
 */

import {
    Grid,
    Column,
    Tile,
    ClickableTile,
    Events,
    Activity,
    Report,
    useNavigate,
    useUser,
    useTranslation,
    useDocumentTitle,
    ExtensionSlot,
    SLOTS,
} from '@zs-health/esm-framework';
import { User as PatientIcon } from '@zs-health/esm-styleguide';
import './HomePage.css';

export function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useUser();

    useDocumentTitle(t('nav.home'));

    return (
        <div className="home-page">
            {/* Welcome Section */}
            <section className="home-welcome">
                <h1 className="home-title">
                    Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="home-subtitle">
                    Here's what's happening in your healthcare facility today.
                </p>
            </section>

            {/* Quick Actions */}
            <section className="home-section">
                <h2 className="home-section-title">Quick Actions</h2>
                <Grid>
                    <Column lg={3} md={4} sm={2}>
                        <ClickableTile
                            className="home-action-tile"
                            onClick={() => navigate('/patients/new')}
                        >
                            <div className="action-icon">
                                <PatientIcon size={32} />
                            </div>
                            <div className="action-content">
                                <h3>Register Patient</h3>
                                <p>Add a new patient to the system</p>
                            </div>
                        </ClickableTile>
                    </Column>

                    <Column lg={3} md={4} sm={2}>
                        <ClickableTile
                            className="home-action-tile"
                            onClick={() => navigate('/appointments/new')}
                        >
                            <div className="action-icon">
                                <Events size={32} />
                            </div>
                            <div className="action-content">
                                <h3>Book Appointment</h3>
                                <p>Schedule a new appointment</p>
                            </div>
                        </ClickableTile>
                    </Column>

                    <Column lg={3} md={4} sm={2}>
                        <ClickableTile
                            className="home-action-tile"
                            onClick={() => navigate('/encounters/new')}
                        >
                            <div className="action-icon">
                                <Activity size={32} />
                            </div>
                            <div className="action-content">
                                <h3>Start Encounter</h3>
                                <p>Begin a patient encounter</p>
                            </div>
                        </ClickableTile>
                    </Column>

                    <Column lg={3} md={4} sm={2}>
                        <ClickableTile
                            className="home-action-tile"
                            onClick={() => navigate('/reports')}
                        >
                            <div className="action-icon">
                                <Report size={32} />
                            </div>
                            <div className="action-content">
                                <h3>View Reports</h3>
                                <p>Access analytics and reports</p>
                            </div>
                        </ClickableTile>
                    </Column>
                </Grid>
            </section>

            {/* Stats Overview */}
            <section className="home-section">
                <h2 className="home-section-title">Today's Overview</h2>
                <Grid>
                    <Column lg={4} md={4} sm={4}>
                        <Tile className="home-stat-tile">
                            <div className="stat-value">24</div>
                            <div className="stat-label">Scheduled Appointments</div>
                        </Tile>
                    </Column>

                    <Column lg={4} md={4} sm={4}>
                        <Tile className="home-stat-tile">
                            <div className="stat-value">12</div>
                            <div className="stat-label">Active Encounters</div>
                        </Tile>
                    </Column>

                    <Column lg={4} md={4} sm={4}>
                        <Tile className="home-stat-tile">
                            <div className="stat-value">156</div>
                            <div className="stat-label">Patients This Week</div>
                        </Tile>
                    </Column>
                </Grid>
            </section>

            {/* Extension Slot for Dashboard Widgets */}
            <ExtensionSlot name={SLOTS.DASHBOARD_WIDGETS} />
        </div>
    );
}

export default HomePage;
