local originalRequire = require

local function mockedRequire(moduleName)
  if moduleName == "ao" then
    return originalRequire("test.mocked-env.ao.ao")
  end

  if moduleName == "handlers-utils" then
    return originalRequire("test.mocked-env.ao.handlers-utils")
  end

  if moduleName == "handlers" then
    return originalRequire("test.mocked-env.ao.handlers")
  end

  if moduleName == ".bint" then
    return originalRequire("test.mocked-env.lib.bint")
  end

  if moduleName == ".utils" then
    return originalRequire("test.mocked-env.lib.utils")
  end

  if moduleName == "json" then
    return originalRequire("test.mocked-env.lib.json")
  end

  if moduleName:match("^lib%.") then
    -- Handle lib module paths
    local libPath = moduleName:gsub("^lib%.", "src/lib/")
    return originalRequire(libPath)
  end

  return originalRequire(moduleName)
end

return function()
  -- Override the require function globally for the tests
  _G.require = mockedRequire

  -- -- Restore the original require function after all tests
  -- teardown(function()
  --   _G.require = originalRequire
  -- end)
end