from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database.database import get_db, engine
from app.database import models
from app.schemas.subject_topic import SubjectTopicCreate, SubjectTopicUpdate, SubjectTopicResponse
from app.core.security import get_current_user, get_current_user_optional

router = APIRouter(
    prefix="/subject-topics",
    tags=["Subject Topics"]
)

def build_tree(nodes: List[models.SubjectTopic], parent_id: Optional[int] = None) -> List[SubjectTopicResponse]:
    branch = []
    for node in nodes:
        if node.parent_id == parent_id:
            children = build_tree(nodes, node.id)
            branch.append(
                SubjectTopicResponse(
                    id=node.id,
                    user_id=node.user_id,
                    parent_id=node.parent_id,
                    name=node.name,
                    created_at=node.created_at,
                    children=children
                )
            )
    return branch


@router.get("/", response_model=List[SubjectTopicResponse])
def get_subject_topics_tree(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    if not current_user:
        return []

    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    # Fetch all subject/topic nodes for the user and construct tree
    all_nodes = db.query(models.SubjectTopic).filter(models.SubjectTopic.user_id == current_user.id).order_by(models.SubjectTopic.id.asc()).all()
    return build_tree(all_nodes, None)


@router.post("/", response_model=SubjectTopicResponse)
def create_subject_topic(
    payload: SubjectTopicCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    # If parent_id provided, verify it belongs to user
    if payload.parent_id is not None:
        parent_node = db.query(models.SubjectTopic).filter(
            models.SubjectTopic.id == payload.parent_id,
            models.SubjectTopic.user_id == current_user.id
        ).first()
        if not parent_node:
            raise HTTPException(status_code=404, detail="Parent subject/topic not found")

    new_node = models.SubjectTopic(
        user_id=current_user.id,
        parent_id=payload.parent_id,
        name=payload.name.strip()
    )

    db.add(new_node)
    db.commit()
    db.refresh(new_node)
    return SubjectTopicResponse(
        id=new_node.id,
        user_id=new_node.user_id,
        parent_id=new_node.parent_id,
        name=new_node.name,
        created_at=new_node.created_at,
        children=[]
    )


@router.put("/{topic_id}", response_model=SubjectTopicResponse)
def update_subject_topic(
    topic_id: int,
    payload: SubjectTopicUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    node = db.query(models.SubjectTopic).filter(
        models.SubjectTopic.id == topic_id,
        models.SubjectTopic.user_id == current_user.id
    ).first()

    if not node:
        raise HTTPException(status_code=404, detail="Subject/topic not found")

    node.name = payload.name.strip()
    db.commit()
    db.refresh(node)
    return SubjectTopicResponse(
        id=node.id,
        user_id=node.user_id,
        parent_id=node.parent_id,
        name=node.name,
        created_at=node.created_at,
        children=[]
    )


@router.delete("/{topic_id}")
def delete_subject_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    node = db.query(models.SubjectTopic).filter(
        models.SubjectTopic.id == topic_id,
        models.SubjectTopic.user_id == current_user.id
    ).first()

    if not node:
        raise HTTPException(status_code=404, detail="Subject/topic not found")

    db.delete(node)
    db.commit()
    return {"message": "Subject/topic deleted successfully"}
