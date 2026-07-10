import re

def clean_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove isDemo from props
    content = re.sub(r'^\s*isDemo:\s*boolean;\s*\n', '', content, flags=re.MULTILINE)
    content = re.sub(r'\{\s*user,\s*isDemo,\s*onLogout\s*\}', '{ user, onLogout }', content)
    
    # 2. Remove simple if (isDemo) returns
    content = re.sub(r'^\s*if\s*\(\s*isDemo\s*\)\s*return;\s*\n', '', content, flags=re.MULTILINE)
    content = re.sub(r'if\s*\(\s*isDemo\s*\|\|\s*!leaderboardSelectedTestId\)\s*return;', 'if (!leaderboardSelectedTestId) return;', content)
    
    # 3. Clean up dependency arrays
    content = content.replace(', isDemo]', ']')
    content = content.replace('[isDemo, ', '[')

    # 4. Remove seedDemoData function entirely
    content = re.sub(r'// Demo Data Seeder.*?(?=export default function)', '', content, flags=re.DOTALL)

    # 5. Remove blocks: `if (isDemo) { ... } else { ... }` 
    # To reliably do this, we find `if (isDemo) {` and track braces.
    # Actually, a simpler regex because the `else {` always immediately follows the `}` of `isDemo` block.
    # We can match `if (isDemo) \{.*?\n\s*\}\s*else\s*\{` and replace with `{` or just nothing if we remove the outer braces.
    
    # Let's match `if (isDemo) { ... } else {` using non-greedy DOTALL.
    # Wait, if there are nested braces inside `isDemo` block, `.*?` might stop at the wrong `}`.
    # So we'll write a simple brace parser in Python!
    
    def remove_demo_blocks(text):
        while 'if (isDemo) {' in text:
            start_idx = text.find('if (isDemo) {')
            
            # Find the closing brace of the if block
            depth = 0
            in_block = False
            else_start = -1
            
            for i in range(start_idx + 12, len(text)):
                if text[i] == '{':
                    depth += 1
                    in_block = True
                elif text[i] == '}':
                    depth -= 1
                    
                if in_block and depth == 0:
                    # Found the end of the if block
                    # Check if there is an `else {` right after
                    remainder = text[i+1:i+20]
                    if 'else' in remainder:
                        else_idx = text.find('else', i)
                        brace_idx = text.find('{', else_idx)
                        
                        # We want to replace from `start_idx` to `brace_idx + 1` with nothing!
                        # BUT wait, the `else` block has a closing brace `}` at the end!
                        # If we just remove `if (isDemo) { ... } else {`, we leave an unmatched `}` at the end of the else block.
                        # So we must also remove that specific `}`.
                        
                        else_depth = 0
                        else_in_block = False
                        end_else_idx = -1
                        for j in range(brace_idx, len(text)):
                            if text[j] == '{':
                                else_depth += 1
                                else_in_block = True
                            elif text[j] == '}':
                                else_depth -= 1
                                
                            if else_in_block and else_depth == 0:
                                end_else_idx = j
                                break
                                
                        # Now we have the exact bounds!
                        # The code inside the else block is text[brace_idx+1 : end_else_idx]
                        else_content = text[brace_idx+1 : end_else_idx]
                        
                        # Replace the whole `if (isDemo) ... else ...` with just the `else_content`!
                        text = text[:start_idx] + else_content + text[end_else_idx+1:]
                        break
                    else:
                        # No else block, just remove the if
                        text = text[:start_idx] + text[i+1:]
                        break
        return text

    content = remove_demo_blocks(content)
    
    # 6. Specific fix for CORS block in StudentPortal
    content = re.sub(r"if\s*\(\s*window\.location\.hostname\s*!==\s*'localhost'\s*\)\s*\{\s*throw\s*new\s*Error\('Skipping\s*local\s*Spring\s*Boot\s*fetch\s*in\s*production\s*to\s*prevent\s*CORS\s*error'\);\s*\}", "", content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

clean_file('src/components/StudentPortal.tsx')
clean_file('src/components/TeacherDashboard.tsx')
print("Demo blocks removed successfully!")
