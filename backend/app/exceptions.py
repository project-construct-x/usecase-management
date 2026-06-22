class VersionConflictError(Exception):
    def __init__(self, current_version, your_version, updated_by, updated_at):
        self.current_version = current_version
        self.your_version = your_version
        self.updated_by = updated_by
        self.updated_at = updated_at