import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ActiveGuard, LogInGuard, MemberGuard } from './services/canActivatePage.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home', canActivate : [LogInGuard],
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'account', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'settings', canActivate : [LogInGuard],
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'company-search', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/company-search/company-search.module').then( m => m.CompanySearchPageModule)
  },
  {
    path: 'company-profile', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/company-profile/company-profile.module').then( m => m.CompanyProfilePageModule)
  },
  {
    path: 'customer-pbx', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/customer-pbx/customer-pbx.module').then( m => m.CustomerPbxPageModule)
  },
  {
    path: 'block-list', canActivate : [MemberGuard],
    loadChildren: () => import('./pages/block-list/block-list.module').then( m => m.BlockListPageModule)
  },
  {
    path: 'contacts', canActivate : [MemberGuard],
    loadChildren: () => import('./pages/contacts/contacts.module').then( m => m.ContactsPageModule)
  },
  {
    path: 'netcast-dashboard', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/netcast-dashboard/netcast-dashboard.module').then( m => m.NetcastDashboardPageModule)
  },
  {
    path: 'netcast-list', canActivate : [MemberGuard],
    loadChildren: () => import('./pages/netcast-list/netcast-list.module').then( m => m.NetcastListPageModule)
  },
  {
    path: 'netcast-details', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/netcast-details/netcast-details.module').then( m => m.NetcastDetailsPageModule)
  },
  {
    path: 'netcast-search', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/netcast-search/netcast-search.module').then( m => m.NetcastSearchPageModule)
  },
  {
    path: 'netcastee', canActivate : [LogInGuard],
    loadChildren: () => import('./pages/netcastee/netcastee.module').then( m => m.NetcasteePageModule)
  },
  {
    path: 'netcaster', canActivate : [MemberGuard],
    loadChildren: () => import('./pages/netcaster/netcaster.module').then( m => m.NetcasterPageModule)
  },
  {
    path: 'meeting-dashboard', canActivate : [MemberGuard],
    loadChildren: () => import('./pages/meeting-dashboard/meeting-dashboard.module').then( m => m.MeetingDashboardPageModule)
  },
  {
    path: 'meetings', canActivate : [LogInGuard],
    loadChildren: () => import('./pages/meetings/meetings.module').then( m => m.MeetingsPageModule)
  },
  {
    path: 'meeting', canActivate : [LogInGuard],
    loadChildren: () => import('./pages/meeting/meeting.module').then( m => m.MeetingPageModule)
  },
  {
    path: 'meeting-invites', canActivate : [LogInGuard],
    loadChildren: () => import('./pages/meeting-invites/meeting-invites.module').then( m => m.MeetingInvitesPageModule)
  },
  {
    path: 'past-meetings', canActivate : [MemberGuard],
    loadChildren: () => import('./pages/past-meetings/past-meetings.module').then( m => m.PastMeetingsPageModule)
  },
  {
    path: 'phone', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/phone/phone.module').then( m => m.PhonePageModule)
  },
  {
    path: 'forgot-password', canActivate : [ActiveGuard],
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./pages/error/error.module').then( m => m.ErrorPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
