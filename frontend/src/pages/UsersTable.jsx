import React from "react";

export default function UsersTable({ users, promote, verifyAlumni }) {
  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Role</th>
          <th>Verified</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u) => (
          <tr key={u.uid}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.department}</td>
            <td>{u.role}</td>
            <td>{u.verified ? "✔️" : "❌"}</td>

            <td className="actions">

              {/* Promote */}
              {u.role === "student" && (
                <button onClick={() => promote(u.uid, "clubMember")}>
                  Promote → Club Member
                </button>
              )}

              {/* Verify Alumni */}
              {u.role === "alumni" && !u.verified && (
                <button onClick={() => verifyAlumni(u.uid)}>
                  Verify Alumni ✔️
                </button>
              )}

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
