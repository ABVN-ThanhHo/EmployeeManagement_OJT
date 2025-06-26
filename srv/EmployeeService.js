module.exports = cds.service.impl(async function () {
  const { Employees, Departments, Roles } = this.entities;

  this.on("me", (req) => {
    return {
      id: req.user.id,
      roles: req.user.roles,
    };
  });
});
