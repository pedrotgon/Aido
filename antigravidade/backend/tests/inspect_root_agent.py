from app.agent import root_agent
print([method for method in dir(root_agent) if not method.startswith('_')])
