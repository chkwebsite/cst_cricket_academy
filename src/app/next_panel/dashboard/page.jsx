"use client";

import React from "react";
import { LayoutDashboard, BarChart3, Users, Calendar, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const MainDashboard = () => {
  const { user } = useAuth();
  console.log("user", user);
  return (
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-12">
          <div className="bg-white rounded-4 shadow-sm p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <LayoutDashboard size={24} />
                  <h1 className="h4 mb-0">Dashboard</h1>
                </div>
                <p className="text-muted mb-0">Welcome to your Cricket Academy admin panel.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-3 p-3">
                <BarChart3 size={24} />
              </div>
              <div>
                <h5 className="card-title mb-1">Analytics</h5>
                <p className="card-text text-muted">Track user activity and performance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-success text-white rounded-3 p-3">
                <Users size={24} />
              </div>
              <div>
                <h5 className="card-title mb-1">Members</h5>
                <p className="card-text text-muted">Monitor coaches and students in real time.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-warning text-white rounded-3 p-3">
                <Calendar size={24} />
              </div>
              <div>
                <h5 className="card-title mb-1">Events</h5>
                <p className="card-text text-muted">Review upcoming practice schedules and events.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0">Messages</h5>
                <span className="badge bg-primary">4 new</span>
              </div>
              <p className="text-muted">Communicate with team members and students.</p>
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0 py-2 d-flex align-items-center gap-3">
                  <MessageCircle size={18} />
                  <div>
                    <div className="fw-semibold">Coach Mary</div>
                    <small className="text-muted">New schedule request</small>
                  </div>
                </div>
                <div className="list-group-item px-0 py-2 d-flex align-items-center gap-3">
                  <MessageCircle size={18} />
                  <div>
                    <div className="fw-semibold">Admin Team</div>
                    <small className="text-muted">System update scheduled</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-info text-white rounded-3 p-3">
                <Settings size={24} />
              </div>
              <div>
                <h5 className="card-title mb-1">System</h5>
                <p className="card-text text-muted">Manage app settings and preferences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
