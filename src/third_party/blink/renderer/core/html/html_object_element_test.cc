// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "third_party/blink/renderer/core/html/html_object_element.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "third_party/blink/renderer/core/css/style_engine.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/dom/shadow_root.h"
#include "third_party/blink/renderer/core/testing/dummy_page_holder.h"

namespace blink {

class HTMLObjectElementTest : public testing::Test {
 protected:
  void SetUp() final {
    dummy_page_holder_ = DummyPageHolder::Create(IntSize(800, 600));
  }
  Document& GetDocument() { return dummy_page_holder_->GetDocument(); }

 private:
  std::unique_ptr<DummyPageHolder> dummy_page_holder_;
};

TEST_F(HTMLObjectElementTest, FallbackRecalcForReattach) {
  GetDocument().body()->SetInnerHTMLFromString(R"HTML(
    <object id='obj' data='dummy'></object>
  )HTML");

  HTMLObjectElement* object =
      ToHTMLObjectElement(GetDocument().getElementById("obj"));
  ASSERT_TRUE(object);

  Node* slot = object->GetShadowRoot()->firstChild();
  ASSERT_TRUE(slot);

  GetDocument().View()->UpdateAllLifecyclePhases();

  object->RenderFallbackContent(nullptr);
  GetDocument().Lifecycle().AdvanceTo(DocumentLifecycle::kInStyleRecalc);
  GetDocument().GetStyleEngine().RecalcStyle(kForce);

  EXPECT_TRUE(IsHTMLSlotElement(slot));
  EXPECT_TRUE(object->UseFallbackContent());
  EXPECT_TRUE(object->GetNonAttachedStyle());
  EXPECT_TRUE(slot->GetNonAttachedStyle());
}

}  // namespace blink
