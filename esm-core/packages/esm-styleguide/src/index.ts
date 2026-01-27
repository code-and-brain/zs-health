/**
 * Carbon Design components and theme for ZS Health
 * Re-exports Carbon components with ZS Health theming
 */

// Re-export Carbon components
export {
    // Layout
    Grid,
    Column,
    Row,
    Stack,
    Layer,

    // Navigation
    Header,
    HeaderName,
    HeaderNavigation,
    HeaderMenu,
    HeaderMenuItem,
    HeaderGlobalBar,
    HeaderGlobalAction,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,

    // UI Components
    Button,
    IconButton,
    Link,
    Tag,

    // Forms
    Form,
    FormGroup,
    TextInput,
    PasswordInput,
    TextArea,
    NumberInput,
    Select,
    SelectItem,
    Checkbox,
    RadioButton,
    RadioButtonGroup,
    Toggle,
    DatePicker,
    DatePickerInput,
    TimePicker,
    TimePickerSelect,
    Search,

    // Data Display
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableToolbarAction,

    // Feedback
    Loading,
    InlineLoading,
    ProgressBar,
    ProgressIndicator,
    ProgressStep,
    ToastNotification,
    InlineNotification,
    ActionableNotification,

    // Overlays
    Modal,
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,

    // Content
    Accordion,
    AccordionItem,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tile,
    ClickableTile,
    ExpandableTile,
    Breadcrumb,
    BreadcrumbItem,

    // Structure
    StructuredListWrapper,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,

    // Theme
    Theme,
    GlobalTheme,
    useTheme,
} from '@carbon/react';

// Re-export common icons
export {
    Add,
    Edit,
    TrashCan,
    View,
    Close,
    Menu,
    Search as SearchIcon,
    Notification,
    NotificationNew,
    UserAvatar,
    Settings,
    Logout,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ChevronUp,
    ArrowRight,
    ArrowLeft,
    Checkmark,
    Warning,
    Information,
    ErrorFilled,
    Home,
    Dashboard,
    Activity,
    Hospital,
    User,
    Events,
    Catalog,
    Report,
    Analytics,
    DocumentBlank,
} from '@carbon/icons-react';

// ZS Health custom theme tokens
export const zsHealthTheme = {
    colors: {
        primary: '#0f62fe',
        secondary: '#393939',
        success: '#24a148',
        warning: '#f1c21b',
        danger: '#da1e28',
        info: '#0043ce',
        background: '#ffffff',
        backgroundHover: '#e8e8e8',
        text: '#161616',
        textSecondary: '#525252',
        textOnColor: '#ffffff',
        border: '#e0e0e0',
        borderStrong: '#8d8d8d',
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem',
    },
    radii: {
        sm: '2px',
        md: '4px',
        lg: '8px',
        full: '9999px',
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
};

export type ZSHealthTheme = typeof zsHealthTheme;
