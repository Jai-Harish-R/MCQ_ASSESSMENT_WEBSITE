const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

// Replace all instances of \n    } catch (err: any) {  where there is no closing brace for try, with \n    } catch...
// Actually, since I removed exactly 1 brace, I can just replace `    } catch (` with `    }\n    } catch (`
// But wait, there might be legitimate `    } catch (` that ALREADY have the `}` closing brace.
// Let's just fix it by looking for the 4 functions.

content = content.replace(
  "        setAttempts([]);\n        }\n    } catch (err: any) {",
  "        setAttempts([]);\n        }\n      }\n    } catch (err: any) {"
);

// Wait, looking at loadData output:
//          setAttempts([]);
//        }
//    } catch (err: any) {
content = content.replace(
  "        }\n    } catch (err: any) {\n      console.error(err);\n      setMsg({ type: 'error', text: err.message || 'Failed to sync database data.' });\n    } finally {",
  "        }\n      }\n    } catch (err: any) {\n      console.error(err);\n      setMsg({ type: 'error', text: err.message || 'Failed to sync database data.' });\n    } finally {"
);

// handleCreateTest
content = content.replace(
  "        loadData();\n        setActiveTab('exams');\n    } catch (err: any) {\n      console.error(err);\n      setMsg({ type: 'error', text: err.message || 'Failed to publish test.' });\n    } finally {",
  "        loadData();\n        setActiveTab('exams');\n      }\n    } catch (err: any) {\n      console.error(err);\n      setMsg({ type: 'error', text: err.message || 'Failed to publish test.' });\n    } finally {"
);

// handleToggleRetry
content = content.replace(
  "        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));\n    } catch (err: any) {\n      console.error(err);\n      alert(err.message || 'Failed to toggle retry permission.');\n    } finally {",
  "        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));\n      }\n    } catch (err: any) {\n      console.error(err);\n      alert(err.message || 'Failed to toggle retry permission.');\n    } finally {"
);

fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
