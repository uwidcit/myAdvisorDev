



function getStudentYear( transcript ) {

    const admitTerm = transcript.admitTerm;
    const admitYear = parseInt(admitTerm.split('/')[0]);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const yearsPassed = currentYear - admitYear;



    return yearsPassed;
}



module.exports = { getStudentYear };

