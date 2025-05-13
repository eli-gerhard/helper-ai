"""Initial database schema

Revision ID: 00001
Revises: 
Create Date: 2025-05-11

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '00001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('auth0_id', sa.String(128), unique=True, nullable=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('username', sa.String(50), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('token_balance', sa.Integer, default=0),
        sa.Column('token_usage_this_month', sa.Integer, default=0),
        sa.Column('last_token_reset', sa.DateTime, server_default=sa.func.now()),
        sa.Column('subscription_tier', sa.String(20), default='free'),
        sa.Column('subscription_end_date', sa.DateTime, nullable=True)
    )
    
    # Create index on users.email
    op.create_index('idx_user_email', 'users', ['email'])
    # Create index on users.auth0_id
    op.create_index('idx_user_auth0_id', 'users', ['auth0_id'])
    
    # Create conversations table
    op.create_table('conversations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), default='New Conversation'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('is_active', sa.Boolean, default=True)
    )
    
    # Create index on conversations.user_id
    op.create_index('idx_conversation_user_id', 'conversations', ['user_id'])
    # Create index on conversations.updated_at
    op.create_index('idx_conversation_updated_at', 'conversations', ['updated_at'])
    
    # Create messages table
    op.create_table('messages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('conversations.id'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('prompt_tokens', sa.Integer, default=0),
        sa.Column('completion_tokens', sa.Integer, default=0),
        sa.Column('total_tokens', sa.Integer, default=0),
        sa.Column('model', sa.String(50), nullable=True)
    )
    
    # Create index on messages.conversation_id
    op.create_index('idx_message_conversation_id', 'messages', ['conversation_id'])
    # Create index on messages.created_at
    op.create_index('idx_message_created_at', 'messages', ['created_at'])
    
    # Create system_prompts table
    op.create_table('system_prompts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Create index on system_prompts.name
    op.create_index('idx_system_prompt_name', 'system_prompts', ['name'])
    
    # Create token_usage table
    op.create_table('token_usage',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.DateTime, server_default=sa.func.now()),
        sa.Column('prompt_tokens', sa.Integer, default=0),
        sa.Column('completion_tokens', sa.Integer, default=0),
        sa.Column('total_tokens', sa.Integer, default=0),
        sa.Column('model', sa.String(50), nullable=True)
    )
    
    # Create index on token_usage.user_id
    op.create_index('idx_token_usage_user_id', 'token_usage', ['user_id'])
    # Create index on token_usage.date
    op.create_index('idx_token_usage_date', 'token_usage', ['date'])


def downgrade() -> None:
    # Drop all tables in reverse order
    op.drop_table('token_usage')
    op.drop_table('system_prompts')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('users')