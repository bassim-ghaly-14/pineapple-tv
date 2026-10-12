import { describe, expect, it } from "vitest";

import {
  adaptEpisodeDetails,
  adaptPersonDetails,
  adaptPersonCombinedCredits,
} from "@/lib/tmdb/adapters";

describe("adaptEpisodeDetails", () => {
  const base = {
    id: 100,
    season_number: 2,
    episode_number: 5,
    name: "Ozymandias",
    overview: "Walter White faces the consequences.",
    still_path: "/still.jpg",
    air_date: "2013-09-08",
    runtime: 47,
    vote_average: 9.7,
    vote_count: 4000,
  };

  it("normalizes a full episode response and attaches showId", () => {
    const ep = adaptEpisodeDetails(base, 1396);
    expect(ep).toMatchObject({
      id: 100,
      showId: 1396,
      seasonNumber: 2,
      episodeNumber: 5,
      name: "Ozymandias",
      overview: "Walter White faces the consequences.",
      stillPath: "/still.jpg",
      airDate: "2013-09-08",
      runtime: 47,
      voteAverage: 9.7,
      voteCount: 4000,
    });
    expect(ep.guestStars).toEqual([]);
    expect(ep.crew).toEqual([]);
  });

  it("defaults missing optional fields safely", () => {
    const ep = adaptEpisodeDetails(
      { id: 101, season_number: 1, episode_number: 1, name: "Pilot", still_path: null, air_date: null },
      1,
    );
    expect(ep.overview).toBe("");
    expect(ep.runtime).toBeNull();
    expect(ep.voteAverage).toBe(0);
    expect(ep.voteCount).toBe(0);
    expect(ep.stillPath).toBeNull();
    expect(ep.airDate).toBeNull();
  });

  it("maps guest stars and crew when present", () => {
    const ep = adaptEpisodeDetails(
      {
        ...base,
        guest_stars: [{ id: 7, name: "Guest Star", profile_path: "/g.jpg", character: "Hector" }],
        crew: [
          { id: 9, name: "Rian Johnson", profile_path: null, job: "Director", department: "Directing" },
        ],
      },
      1396,
    );
    expect(ep.guestStars).toEqual([
      { id: 7, name: "Guest Star", profilePath: "/g.jpg", character: "Hector", order: 0 },
    ]);
    expect(ep.crew).toEqual([
      { id: 9, name: "Rian Johnson", profilePath: null, job: "Director", department: "Directing" },
    ]);
  });

  it("rejects malformed responses missing load-bearing fields", () => {
    expect(() =>
      adaptEpisodeDetails({ season_number: 1, episode_number: 1, name: "X" }, 1),
    ).toThrow();
  });
});

describe("adaptPersonDetails", () => {
  it("normalizes a full person response", () => {
    const person = adaptPersonDetails({
      id: 500,
      name: "Tom Hardy",
      biography: "An English actor.",
      profile_path: "/tom.jpg",
      known_for_department: "Acting",
      birthday: "1977-09-15",
      deathday: null,
      place_of_birth: "London, England, UK",
      also_known_as: ["Edward Thomas Hardy"],
      imdb_id: "nm0362766",
      homepage: null,
    });
    expect(person).toEqual({
      id: 500,
      name: "Tom Hardy",
      biography: "An English actor.",
      profilePath: "/tom.jpg",
      knownForDepartment: "Acting",
      birthday: "1977-09-15",
      deathday: null,
      placeOfBirth: "London, England, UK",
      alsoKnownAs: ["Edward Thomas Hardy"],
      imdbId: "nm0362766",
      homepage: null,
    });
  });

  it("defaults missing optional fields", () => {
    const person = adaptPersonDetails({
      id: 501,
      name: "Mystery Person",
      profile_path: null,
      known_for_department: null,
    });
    expect(person.biography).toBe("");
    expect(person.birthday).toBeNull();
    expect(person.deathday).toBeNull();
    expect(person.placeOfBirth).toBeNull();
    expect(person.alsoKnownAs).toEqual([]);
    expect(person.imdbId).toBeNull();
    expect(person.homepage).toBeNull();
  });
});

describe("adaptPersonCombinedCredits", () => {
  const combined = {
    id: 500,
    cast: [
      {
        id: 550,
        media_type: "movie",
        title: "Fight Club",
        poster_path: "/fc.jpg",
        backdrop_path: "/fcb.jpg",
        release_date: "1999-10-15",
        vote_average: 8.4,
        vote_count: 25000,
        character: "Bob Paulson",
        order: 0,
      },
      {
        id: 1399,
        media_type: "tv",
        name: "Peaky Blinders",
        poster_path: "/pb.jpg",
        backdrop_path: "/pbb.jpg",
        first_air_date: "2013-09-12",
        vote_average: 8.5,
        vote_count: 7000,
        character: "Alfie Solomons",
        order: 1,
      },
      {
        id: 550,
        media_type: "movie",
        title: "Fight Club",
        poster_path: "/fc.jpg",
        backdrop_path: "/fcb.jpg",
        release_date: "1999-10-15",
        vote_average: 8.4,
        vote_count: 25000,
        character: "Bob Paulson",
        order: 0,
      },
    ],
    crew: [
      {
        id: 550,
        media_type: "movie",
        title: "Fight Club",
        poster_path: "/fc.jpg",
        backdrop_path: "/fcb.jpg",
        release_date: "1999-10-15",
        vote_average: 8.4,
        vote_count: 25000,
        job: "Producer",
        department: "Production",
      },
    ],
  };

  it("separates acting and crew credits and deduplicates identical cast entries", () => {
    const film = adaptPersonCombinedCredits(combined);
    expect(film.cast).toHaveLength(2);
    expect(film.crew).toHaveLength(1);

    const movie = film.cast.find((c) => c.mediaType === "movie");
    expect(movie).toMatchObject({
      id: 550,
      mediaType: "movie",
      title: "Fight Club",
      character: "Bob Paulson",
      year: 1999,
    });

    const show = film.cast.find((c) => c.mediaType === "tv");
    expect(show).toMatchObject({
      id: 1399,
      mediaType: "tv",
      title: "Peaky Blinders",
      character: "Alfie Solomons",
      year: 2013,
    });

    expect(film.crew[0]).toMatchObject({
      id: 550,
      mediaType: "movie",
      job: "Producer",
      department: "Production",
    });
  });

  it("drops unsupported media types and keeps movie/tv only", () => {
    const film = adaptPersonCombinedCredits({
      id: 1,
      cast: [
        { id: 10, media_type: "person", name: "Someone", poster_path: null, backdrop_path: null },
        { id: 11, media_type: "tv", name: "Show", poster_path: null, backdrop_path: null, character: "Role" },
      ],
      crew: [],
    });
    expect(film.cast).toHaveLength(1);
    expect(film.cast[0].id).toBe(11);
  });

  it("returns empty lists when there are no credits", () => {
    const film = adaptPersonCombinedCredits({ id: 1, cast: [], crew: [] });
    expect(film.cast).toEqual([]);
    expect(film.crew).toEqual([]);
  });
});

