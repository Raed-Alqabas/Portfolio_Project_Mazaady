import { createBrowserRouter } from "react-router";
import { HomePage } from "../components/HomePage";
import { AuctionsPage } from "../components/AuctionsPage";
import { CarsPage } from "../components/CarsPage";
import { AuctionDetailsPage } from "../components/AuctionDetailsPage";
import { MyBidsPage } from "../components/MyBidsPage";
import { MyAdsPage } from "../components/MyAdsPage";
import { ProfilePage } from "../components/ProfilePage";
import { AddCarPage } from "../components/AddCarPage";
import { EditCarPage } from "../components/EditCarPage";
import { FavoritesPage } from "../components/FavoritesPage";
import { DashboardPage } from "../components/DashboardPage";
import { TermsPage } from "../components/TermsPage";
import { PrivacyPage } from "../components/PrivacyPage";
import { NotificationsPage } from "../components/NotificationsPage";
import { RootLayout } from "../components/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "auctions", Component: AuctionsPage },
      { path: "cars", Component: CarsPage },
      { path: "auction/:id", Component: AuctionDetailsPage },
      { path: "my-bids", Component: MyBidsPage },
      { path: "my-ads", Component: MyAdsPage },
      { path: "favorites", Component: FavoritesPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "profile", Component: ProfilePage },
      { path: "add-car", Component: AddCarPage },
      { path: "edit-car/:id", Component: EditCarPage },
      { path: "terms", Component: TermsPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "notifications", Component: NotificationsPage },
    ],
  },
]);