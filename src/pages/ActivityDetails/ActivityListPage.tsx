import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { useActivityDetailsContext } from "./context/useActivityDetailsContext";
import type { Activity } from "../../supabase/supabase.fitFiles";

const ActivityListPage = () => {
  const navigate = useNavigate();
  const {
    activities,
    loading,
    error,
    setSelectedActivity,
    deleteActivityById,
    deleting,
  } = useActivityDetailsContext();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formatDate = useCallback((timestamp: string): string => {
    try {
      return DateTime.fromISO(timestamp).toFormat("MMMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      console.log("Clicked activity full metadata:", activity);
      setSelectedActivity(activity);
      navigate(`/activities/${activity.id}`);
    },
    [setSelectedActivity, navigate]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, activityId: string) => {
      e.stopPropagation(); // Prevent activity click
      setConfirmDelete(activityId);
      setDeleteError(null);
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;

    try {
      const result = await deleteActivityById(confirmDelete);
      if (result.success) {
        setConfirmDelete(null);
        setDeleteError(null);
      } else {
        setDeleteError(result.error || "Failed to delete activity");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("An unexpected error occurred");
    }
  }, [confirmDelete, deleteActivityById]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  const activityList = useMemo(() => {
    return activities.map((activity) => (
      <ActivityItem
        key={activity.id}
        onClick={() => handleActivityClick(activity)}
      >
        <ActivityContent>
          <ActivityInfo>
            <ActivityName>{activity.name || "Unnamed Activity"}</ActivityName>
            <ActivityDate>
              {formatDate(activity.activity_timestamp)}
            </ActivityDate>
            {activity.sport && (
              <ActivitySport>Sport: {activity.sport}</ActivitySport>
            )}
          </ActivityInfo>
          <ActivityActions>
            <DeleteButton
              onClick={(e) => handleDeleteClick(e, activity.id)}
              disabled={deleting}
              aria-label="Delete activity"
            >
              🗑️
            </DeleteButton>
          </ActivityActions>
        </ActivityContent>
      </ActivityItem>
    ));
  }, [
    activities,
    formatDate,
    handleActivityClick,
    handleDeleteClick,
    deleting,
  ]);

  if (loading) {
    return (
      <Container>
        <Title>Activities</Title>
        <LoadingText>Loading activities...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Activities</Title>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Activities ({activities.length})</Title>

      {deleteError && <ErrorText>{deleteError}</ErrorText>}

      {activities.length === 0 ? (
        <LoadingText>No activities found</LoadingText>
      ) : (
        <ActivityList>{activityList}</ActivityList>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <DialogOverlay>
          <DialogContent>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogMessage>
              Are you sure you want to delete this activity? This action cannot
              be undone and will remove all associated data including laps,
              records, and files.
            </DialogMessage>
            <DialogActions>
              <DialogButton onClick={handleCancelDelete} variant="secondary">
                Cancel
              </DialogButton>
              <DialogButton
                onClick={handleConfirmDelete}
                variant="danger"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </DialogButton>
            </DialogActions>
          </DialogContent>
        </DialogOverlay>
      )}
    </Container>
  );
};

export default ActivityListPage;

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 20px;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.light};
    transform: translateX(4px);
  }
`;

const ActivityDate = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ActivitySport = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  margin-top: 4px;
`;

const LoadingText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-style: italic;
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.light};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
`;

// New styled components for enhanced activity items
const ActivityContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const ActivityActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.danger}dd;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Dialog styled components
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DialogTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

const DialogMessage = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

interface DialogButtonProps {
  variant?: "primary" | "secondary" | "danger";
}

const DialogButton = styled.button<DialogButtonProps>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant, theme }) => {
    switch (variant) {
      case "danger":
        return `
          background: ${theme.colors.danger};
          color: white;
          &:hover:not(:disabled) {
            background: ${theme.colors.danger}dd;
          }
        `;
      case "secondary":
        return `
          background: ${theme.colors.light};
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};
          &:hover:not(:disabled) {
            background: ${theme.colors.border};
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: white;
          &:hover:not(:disabled) {
            background: ${theme.colors.primary}dd;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
