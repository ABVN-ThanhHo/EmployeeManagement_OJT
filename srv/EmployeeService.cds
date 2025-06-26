using my.company as db from '../db/schema';

service EmployeeService {
    @restrict: [
        {
            grant: ['*'],
            to   : ['Admin']
        },
        {
            grant: ['READ'],
            to   : ['Viewer']
        }
    ]
    entity Employees   as
        projection on db.Employees {
            *,
            role.name       as roleName,
            department.name as departmentName
        };

    @readonly
    @restrict: [{
        grant: ['READ'],
        to   : ['any']
    }]
    entity Roles       as projection on db.Roles;

    @readonly
    @restrict: [{
        grant: ['READ'],
        to   : ['any']
    }]
    entity Departments as projection on db.Departments;

    // Get user login information
    function me()              returns {
        id    : String;
        roles : many String;
    };
};
