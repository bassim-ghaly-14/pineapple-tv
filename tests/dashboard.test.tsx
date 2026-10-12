// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { PersonalStateProvider } from "@/lib/state/PersonalStateContext";

// Storage keys are prefixed with "pineapple:" by the storage layer.
function seed(key: string, value: unknown) {
  window.localStorage.setItem(`pineapple:${key}`, JSON.stringify(value));
}

function renderDashboard() {
  return render(
    <PersonalStateProvider>
      <DashboardPage />
    </PersonalStateProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  // Defaults so stats render deterministically unless a test overrides them.
  seed("watchlist", []);
  seed("favorites", []);
  seed("watched-movies", []);
  seed("watched-tv", []);
  seed("ratings", []);
  seed("activity", []);
});

afterEach(() => {
  cleanup();
});

describe("Dashboard statistics cards navigation", () => {
  it("links the Watchlist stat to the existing /watchlist page", () => {
    seed("watchlist", [
      { id: 1, mediaType: "movie", title: "A", posterPath: null, addedAt: 1 },
      { id: 2, mediaType: "tv", title: "B", posterPath: null, addedAt: 2 },
    ]);
    renderDashboard();

    const link = screen.getByRole("link", { name: "View Watchlist" });
    expect(link.getAttribute("href")).toBe("/watchlist");
    // The represented count is still visible on the card surface.
    expect(within(link).getByText("2")).toBeTruthy();
  });

  it("links the Favorites stat to the existing /favorites page", () => {
    seed("favorites", [{ id: 9, mediaType: "movie", title: "Fav", posterPath: null, addedAt: 1 }]);
    renderDashboard();

    const link = screen.getByRole("link", { name: "View Favorites" });
    expect(link.getAttribute("href")).toBe("/favorites");
  });

  it("keeps statistics without a genuine destination non-clickable", () => {
    seed("watched-movies", [1, 2, 3]);
    seed("ratings", [
      { id: 1, mediaType: "movie", title: "A", posterPath: null, rating: 4, updatedAt: 1 },
      { id: 2, mediaType: "tv", title: "B", posterPath: null, rating: 2, updatedAt: 2 },
    ]);
    renderDashboard();

    // These metrics have no dedicated existing page, so they must not be links.
    for (const label of [
      "Movies Watched",
      "Shows Tracked",
      "Episodes Watched",
      "Average Rating",
      "Titles Rated",
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.queryByRole("link", { name: `View ${label}` })).toBeNull();
    }
  });
});

describe("Continue Watching cards", () => {
  it("resumes a TV show from its last watched season", () => {
    seed("watched-tv", [
      {
        showId: 100,
        title: "Breaking Bad",
        posterPath: "/bb.jpg",
        seasons: [
          { seasonNumber: 1, watchedEpisodes: [1, 2] },
          { seasonNumber: 2, watchedEpisodes: [5] },
        ],
        lastWatchedSeason: 2,
        lastWatchedEpisode: 5,
        updatedAt: 1,
      },
    ]);
    renderDashboard();

    const card = screen.getByRole("link", { name: /Breaking Bad/ });
    // Resume target is the last watched season (not an episode-level reset).
    expect(card.getAttribute("href")).toBe("/tv/100/season/2");
    expect(within(card).getByText(/Season 2 · Episode 5/)).toBeTruthy();
  });

  it("falls back to the show page when no season has been watched yet", () => {
    seed("watched-tv", [
      {
        showId: 200,
        title: "New Show",
        posterPath: null,
        seasons: [],
        lastWatchedSeason: null,
        lastWatchedEpisode: null,
        updatedAt: 1,
      },
    ]);
    renderDashboard();

    const card = screen.getByRole("link", { name: /New Show/ });
    expect(card.getAttribute("href")).toBe("/tv/200");
    expect(within(card).getByText("Started")).toBeTruthy();
  });

  it("shows a placeholder title when the snapshot title is missing", () => {
    seed("watched-tv", [
      {
        showId: 300,
        title: null,
        posterPath: null,
        seasons: [{ seasonNumber: 1, watchedEpisodes: [1] }],
        lastWatchedSeason: 1,
        lastWatchedEpisode: 1,
        updatedAt: 1,
      },
    ]);
    renderDashboard();

    const card = screen.getByRole("link", { name: /Show #300/ });
    expect(card.getAttribute("href")).toBe("/tv/300/season/1");
  });

  it("keeps the Continue affordance inside a single link with no nested interactive elements", () => {
    seed("watched-tv", [
      {
        showId: 100,
        title: "Breaking Bad",
        posterPath: "/bb.jpg",
        seasons: [{ seasonNumber: 2, watchedEpisodes: [5] }],
        lastWatchedSeason: 2,
        lastWatchedEpisode: 5,
        updatedAt: 1,
      },
    ]);
    const { container } = renderDashboard();

    const card = screen.getByRole("link", { name: /Breaking Bad/ });
    // The Continue label is part of the same card surface.
    expect(within(card).getByText("Continue")).toBeTruthy();
    // No nested <a> or <button> inside the card link.
    expect(card.querySelector("a")).toBeNull();
    expect(card.querySelector("button")).toBeNull();

    // Exactly one Continue card link exists for one tracked show.
    const continueLinks = Array.from(container.querySelectorAll("a")).filter((a) =>
      a.textContent?.includes("Continue"),
    );
    expect(continueLinks).toHaveLength(1);
  });

  it("omits the Continue Watching section when nothing is in progress", () => {
    renderDashboard();
    expect(screen.queryByText("Continue Watching")).toBeNull();
  });
});

