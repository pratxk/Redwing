import { MissionsProvider } from './MissionsContext';
import { DronesProvider } from './DronesContext';
import { UsersProvider } from './UsersContext';
import { SitesProvider } from './SitesContext';
import { SettingsProvider } from './SettingsContext';
import { AnalyticsProvider } from './AnalyticsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AnalyticsProvider>
        <SitesProvider>
          <UsersProvider>
            <DronesProvider>
              <MissionsProvider>
                {children}
              </MissionsProvider>
            </DronesProvider>
          </UsersProvider>
        </SitesProvider>
      </AnalyticsProvider>
    </SettingsProvider>
  );
} 