import React from 'react';

import styles from './FormField.module.scss';

interface FormFieldProps {
  label: string;
  caption?: React.ReactNode;
  /** Preferred control id used for both label htmlFor and child control id. */
  id?: string;
  /** Legacy alias of `id`, kept for backward compatibility. */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

const CONTROL_TAGS = new Set(['input', 'textarea', 'select']);

type LinkResult = {
  node: React.ReactNode;
  controlId?: string;
};

type ControlElementProps = {
  id?: string;
  children?: React.ReactNode;
  'aria-describedby'?: string;
};

type DescribeResult = {
  node: React.ReactNode;
  described: boolean;
};

const isControlElement = (element: React.ReactElement<ControlElementProps>) => {
  const children = element.props.children;
  const isIntrinsicControl =
    typeof element.type === 'string' && CONTROL_TAGS.has(element.type.toLowerCase());
  const isLeaf = React.Children.count(children) === 0;
  const isLikelyCustomControl = typeof element.type !== 'string' && isLeaf;

  return isIntrinsicControl || isLikelyCustomControl;
};

function linkFirstControl(node: React.ReactNode, targetId: string): LinkResult {
  if (!React.isValidElement(node)) return { node };

  const element = node as React.ReactElement<ControlElementProps>;
  const children = element.props.children;

  let nextChildren = children;
  let controlId: string | undefined;

  if (children !== undefined) {
    let found = false;
    nextChildren = React.Children.map(children, (child) => {
      if (found) return child;
      const result = linkFirstControl(child, targetId);
      if (result.controlId) {
        found = true;
        controlId = result.controlId;
      }
      return result.node;
    });
  }

  if (controlId) {
    if (nextChildren !== children) {
      return { node: React.cloneElement(element, { children: nextChildren }), controlId };
    }
    return { node, controlId };
  }

  const isControl = isControlElement(element);
  const currentId = element.props.id;

  if (currentId && isControl) {
    return {
      node: nextChildren !== children ? React.cloneElement(element, { children: nextChildren }) : node,
      controlId: currentId,
    };
  }

  if (isControl) {
    return {
      node: React.cloneElement(element, { id: targetId, children: nextChildren }),
      controlId: targetId,
    };
  }

  if (nextChildren !== children) {
    return { node: React.cloneElement(element, { children: nextChildren }) };
  }

  return { node };
}

function describeFirstControl(node: React.ReactNode, captionId: string): DescribeResult {
  if (!React.isValidElement(node)) return { node, described: false };

  const element = node as React.ReactElement<ControlElementProps>;
  const children = element.props.children;

  let nextChildren = children;
  let described = false;

  if (children !== undefined) {
    nextChildren = React.Children.map(children, (child) => {
      if (described) return child;
      const result = describeFirstControl(child, captionId);
      if (result.described) {
        described = true;
      }
      return result.node;
    });
  }

  if (described) {
    if (nextChildren !== children) {
      return { node: React.cloneElement(element, { children: nextChildren }), described: true };
    }
    return { node, described: true };
  }

  if (isControlElement(element)) {
    const existing = element.props['aria-describedby'];
    const tokens = existing ? existing.split(/\s+/).filter(Boolean) : [];
    if (!tokens.includes(captionId)) tokens.push(captionId);

    return {
      node: React.cloneElement(element, {
        'aria-describedby': tokens.join(' '),
        children: nextChildren,
      }),
      described: true,
    };
  }

  if (nextChildren !== children) {
    return { node: React.cloneElement(element, { children: nextChildren }), described: false };
  }

  return { node, described: false };
}

/**
 * Layout wrapper that stacks: label → caption → children (input or textarea).
 * Use this instead of the built-in `label` prop on Input/Textarea when you
 * need a descriptive caption beneath the label.
 */
export default function FormField({ label, caption, id, htmlFor, children, className }: FormFieldProps) {
  const autoId = React.useId();
  const preferredId = id ?? htmlFor ?? autoId;
  const linked = React.useMemo(() => linkFirstControl(children, preferredId), [children, preferredId]);
  const labelFor = id ?? htmlFor ?? linked.controlId;
  const captionId = React.useId();
  const described = React.useMemo(() => {
    if (!caption) return linked.node;
    return describeFirstControl(linked.node, captionId).node;
  }, [caption, captionId, linked.node]);
  const classes = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className={styles.labels}>
        <label htmlFor={labelFor} className={styles.label}>
          {label}
        </label>
        {caption && (
          <p id={captionId} className={styles.caption}>
            {caption}
          </p>
        )}
      </div>
      {described}
    </div>
  );
}
