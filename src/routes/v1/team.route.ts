import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { teamController, teamValidation } from '../../modules/team';
import { isTeamAdmin, isTeamMember, isTeamOwner } from '../../modules/middleware';

const router: Router = express.Router();

router
  .route('/')
  .post(auth(), validate(teamValidation.createTeam), teamController.createTeam)
  .get(auth('getTeams'), validate(teamValidation.getTeams), teamController.getTeams);

router.route('/join-team').get(validate(teamValidation.joinTeam), teamController.joinTeam);
router.route('/leave-team').get(auth(), teamController.leaveTeam);

router
  .route('/:teamId/team-members')
  .get(auth(), validate(teamValidation.getTeamMembers), isTeamMember, teamController.getTeamMembers);
router
  .route('/:teamId/team-leads')
  .get(auth(), validate(teamValidation.getTeamLeads), isTeamAdmin, teamController.getTeamLeads);
router
  .route('/:teamId/invite-members')
  .post(auth(), validate(teamValidation.inviteMembers), isTeamAdmin, teamController.inviteMembers);
router
  .route('/:teamId/create-member')
  .post(auth(), validate(teamValidation.createMember), isTeamAdmin, teamController.createMember);
router
  .route('/:teamId/remove-member')
  .post(auth(), validate(teamValidation.removeMember), isTeamAdmin, teamController.removeMember);
router
  .route('/:teamId/update-member')
  .post(auth(), validate(teamValidation.updateMember), isTeamAdmin, teamController.updateMember);
router
  .route('/:teamId/cancel-plan')
  .get(auth(), validate(teamValidation.cancelPlan), isTeamOwner, teamController.cancelPlan);

router
  .route('/:teamId')
  .get(auth(), validate(teamValidation.getTeam), teamController.getTeam)
  .patch(auth(), validate(teamValidation.updateTeam), isTeamAdmin, teamController.updateTeam)
  .delete(auth('manageTeams'), validate(teamValidation.deleteTeam), teamController.deleteTeam);

export default router;
