"use client";

import Link from "next/link";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchManagementIndex() {
  const { user } = useAuth();

  return (
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-12">
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h1 className="h4 mb-0">Match Management</h1>
                </div>
                <p className="text-muted mb-0">Central hub to manage matches, scorecards, match types and related data.</p>
              </div>

              {/* Optionally add a quick "New Match" button if user can create matches */}
              {user?.permissions?.includes("matches.create") && (
                <Link href="/next_panel/match_management/matches/new" className="btn btn-primary fw-semibold">
                  New Match
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Matches</h5>
                  <p className="card-text text-muted">Create, edit and view scheduled matches and results.</p>
                  <Link href="/next_panel/match_management/matches" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Scorecards</h5>
                  <p className="card-text text-muted">Manage match scorecards and innings details.</p>
                  <Link href="/next_panel/match_management/match-scorecard" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Match Types</h5>
                  <p className="card-text text-muted">Define and manage match types (e.g., T20, ODI, Test).</p>
                  <Link href="/next_panel/match_management/match-types" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Innings</h5>
                  <p className="card-text text-muted">View and edit innings for matches.</p>
                  <Link href="/next_panel/match_management/match-innings" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Bowling</h5>
                  <p className="card-text text-muted">Manage bowling records and statistics for matches.</p>
                  <Link href="/next_panel/match_management/match-bowling" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Team Players</h5>
                  <p className="card-text text-muted">Assign and manage players for match teams.</p>
                  <Link href="/next_panel/match_management/match-team-players" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Awards</h5>
                  <p className="card-text text-muted">Manage awards and player recognitions for matches.</p>
                  <Link href="/next_panel/match_management/match-awards" className="btn btn-outline-primary btn-sm">Open</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
