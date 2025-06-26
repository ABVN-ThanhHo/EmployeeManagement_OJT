namespace my.company;

using {managed} from '@sap/cds/common';

entity Roles : managed {
    key ID         : UUID;
        name       : String @mandatory;
        baseSalary : Decimal(10, 2);
}

entity Departments : managed {
    key ID   : UUID;
        name : String @mandatory;
}

entity Employees : managed {
    key ID          : UUID;
        firstName   : String @mandatory;
        lastName    : String @mandatory;
        dateOfBirth : Date;
        gender      : String(10);
        email       : String @mandatory;
        hireDate    : Date   @mandatory;
        salary      : Decimal(10,2); 
        role        : Association to Roles;
        department  : Association to Departments;
}
