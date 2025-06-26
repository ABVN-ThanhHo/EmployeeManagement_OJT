module.exports = cds.service.impl(async function () {
  const { Employees, Departments, Roles } = this.entities;

  this.on("calculateSalary", async (req) => {
    const employeeID = req.params[0].ID;

    // Get employee and role base salary
    const employee = await cds
      .transaction(req)
      .run(
        SELECT.one
          .from(Employees)
          .columns("hireDate", "role_ID")
          .where({ ID: employeeID })
      );

    if (!employee) {
      return req.error(404, "Employee not found");
    }

    const role = await cds
      .transaction(req)
      .run(
        SELECT.one
          .from(Roles)
          .columns("baseSalary")
          .where({ ID: employee.role_ID })
      );

    if (!role) {
      return req.error(404, "Role not found");
    }

    const baseSalary = parseFloat(role.baseSalary) || 0;

    // Calculate years of service
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    let yearsOfService = now.getFullYear() - hireDate.getFullYear();

    // Adjust if current date is before hire anniversary
    const monthDiff = now.getMonth() - hireDate.getMonth();
    const dayDiff = now.getDate() - hireDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      yearsOfService--;
    }

    const bonus = yearsOfService * 1000;
    const totalSalary = baseSalary + bonus;

    return totalSalary;
  });

  this.after("READ", Employees, async (employees, req) => {
    const list = Array.isArray(employees) ? employees : [employees];

    // Fetch all Roles with salaries
    const roles = await SELECT.from(Roles);
    const roleMap = {};
    roles.forEach((role) => (roleMap[role.ID] = role.baseSalary));

    for (let emp of list) {
      if (!emp.hireDate || !emp.role_ID) {
        emp.salary = 0;
        continue;
      }

      const baseSalary = roleMap[emp.role_ID] || 0;
      const hireDate = new Date(emp.hireDate);
      const today = new Date();

      let yearsOfService = today.getFullYear() - hireDate.getFullYear();
      const monthDiff = today.getMonth() - hireDate.getMonth();
      const dayDiff = today.getDate() - hireDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        yearsOfService--;
      }

      emp.salary = baseSalary + yearsOfService * 1000;
    }
  });

  this.on("me", (req) => {
    return {
      id: req.user.id,
      roles: req.user.roles,
    };
  });
});
