/**
 * Legacy localStorage store removed. Portal data is persisted in Supabase with RLS.
 */
(function () {
    "use strict";
    window.kvStorage = {
        getSponsors: function () { return []; },
        addSponsor: function () {},
        getProposals: function () { return []; },
        addProposal: function () {},
        updateProposalStatus: function () {},
        getProjects: function () { return []; },
        updateProjectProgress: function () {}
    };
})();
