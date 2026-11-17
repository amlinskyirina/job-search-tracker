import { useEffect, useId, useRef } from "react";
import styled from "styled-components";

const Dialog = styled.dialog`
  box-sizing: border-box;
  width: min(420px, calc(100% - 32px));
  padding: 24px;
  border: 1px solid #ccd9ee;
  border-radius: 14px;
  background: #fff;
  color: #0f2044;
  text-align: start;

  &::backdrop {
    background: #0f172a80;
  }

  h2 {
    margin: 0 0 12px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;

  button {
    min-height: 44px;
    padding: 8px 16px;
    border: 1px solid #bac9dc;
    border-radius: 8px;
    background: #fff;
    color: #0f2044;
    font: inherit;
    cursor: pointer;
  }

  button[data-action="confirm"] {
    border-color: #b91c1c;
    background: #b91c1c;
    color: #fff;
  }
`;

export default function DeleteJobModal({ jobTitle, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    cancelButtonRef.current.focus();

    return () => dialog.close();
  }, []);

  return (
    <Dialog
      ref={dialogRef}
      dir="rtl"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id={titleId}>מחיקת משרה</h2>

      <p id={descriptionId}>
        האם למחוק את המשרה ״<bdi>{jobTitle}</bdi>״?
      </p>

      <Actions>
        <button ref={cancelButtonRef} type="button" onClick={onCancel}>
          ביטול
        </button>

        <button type="button" data-action="confirm" onClick={onConfirm}>
          מחיקה
        </button>
      </Actions>
    </Dialog>
  );
}